
const mongoose = require("mongoose");
const responseHandler = require("../utils/responseHandler");
const { StatusCode } = require("../consts/statusCode");
const { generateSlots } = require("../utils/slots");
const crypto = require("crypto");

const { sendGuestBookingConfirmation } = require("../utils/emailService");
const Patient = require("../models/patient");
const Therapist = require("../models/therapist");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const Holidays = require("../models/holiday");
const AppointmentLock = require("../models/appointmentLock");

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const buildDateTime = (date, time) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const findOverlappingAppointments = async (
  therapistId,
  start,
  end,
  session = null,
  excludeAppointmentId = null
) => {
  const filter = {
    therapist: therapistId,
    status: { $in: ["pending", "confirmed"] },
    appointmentDate: { $lt: end },
    $or: [
      { appointmentEnd: { $gt: start } },
      {
        appointmentEnd: { $exists: false },
        appointmentDate: { $gte: start }
      }
    ]
  };

  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }

  const query = Appointment.find(filter);

  if (session) query.session(session);

  return query;
};

// Appointment locks
const LOCK_DURATION_MS = 5 * 60 * 1000;

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const acquireAppointmentLock = async (therapistId, dateKey) => {
  const now = new Date();
  const lockToken = crypto.randomUUID();

  try {
    const lock = await AppointmentLock.findOneAndUpdate(
      {
        therapist: therapistId,
        dateKey,
        lockedUntil: { $lte: now }
      },
      {
        $set: {
          lockToken,
          lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS)
        },
        $setOnInsert: {
          therapist: therapistId,
          dateKey
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    if (!lock) return null;

    return lockToken;
  } catch (error) {
    if (error.code === 11000) {
      return null;
    }

    throw error;
  }
};

const releaseAppointmentLock = async (therapistId, dateKey, lockToken) => {
  await AppointmentLock.deleteOne({
    therapist: therapistId,
    dateKey,
    lockToken
  });
};

const getAvailableSlots = async (req, res) => {
  try {
   
    const { therapistId, serviceId, date } = req.query;

    if (
      !mongoose.isValidObjectId(therapistId) ||
      !mongoose.isValidObjectId(serviceId) ||
      !date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide valid therapist ID, service ID, and date in YYYY-MM-DD format."
      );
    }

    const requestedDay = new Date(`${date}T12:00:00`).getDay();

    const [therapistRecord, serviceRecord] = await Promise.all([
      Therapist.findById(therapistId),
      Service.findOne({ _id: serviceId, isActive: true })
    ]);

    if (!therapistRecord || therapistRecord.inactive) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Therapist not found or inactive."
      );
    }

    if (!serviceRecord) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Active service not found."
      );
    }

    const schedule = (therapistRecord.availability || []).filter(
      (item) => item.dayOfWeek === requestedDay
    );

    if (!schedule.length) {
      return responseHandler(
        res,
        StatusCode.SUCCESS,
        "Available slots retrieved successfully.",
        {
          date,
          serviceDuration: serviceRecord.duration,
          availableSlots: []
        }
      );
    }

    const dayStart = buildDateTime(date, "00:00");
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const holidays = await Holidays.find({
      date: { $gte: dayStart, $lt: nextDay },
      $or: [
        { scope: "clinic" },
        { scope: "therapist", therapist: therapistId }
      ]
    });

    if (holidays.length) {
      return responseHandler(
        res,
        StatusCode.SUCCESS,
        "Appointments are unavailable on this holiday.",
        {
          date,
          serviceDuration: serviceRecord.duration,
          availableSlots: []
        }
      );
    }

    const appointments = await Appointment.find({
      therapist: therapistId,
      status: { $in: ["pending", "confirmed"] },
      appointmentDate: { $lt: nextDay },
      $or: [
        { appointmentEnd: { $gt: dayStart } },
        {
          appointmentEnd: { $exists: false },
          appointmentDate: { $gte: dayStart }
        }
      ]
    });

    const availableSlots = [];
    const duration = serviceRecord.duration;

    for (const shift of schedule) {
      const bookedSlots = appointments.map((appointment) => {
        const start = appointment.appointmentDate;

        return `${String(start.getHours()).padStart(2, "0")}:${String(
          start.getMinutes()
        ).padStart(2, "0")}`;
      });

      const generatedTimes = generateSlots({
        date,
        workStart: shift.startTime,
        workEnd: shift.endTime,
        sessionMinutes: duration,
        bookedSlots,
        now: new Date()
      });

      for (const startTime of generatedTimes) {
        const start = buildDateTime(date, startTime);
        const end = new Date(start.getTime() + duration * 60 * 1000);

        const isBooked = appointments.some((appointment) => {
          const existingEnd = appointment.appointmentEnd;

          if (!existingEnd) {
            return (
              appointment.appointmentDate >= start &&
              appointment.appointmentDate < end
            );
          }

          return (
            appointment.appointmentDate < end &&
            existingEnd > start
          );
        });

        if (!isBooked) {
          const endMinutes = timeToMinutes(startTime) + duration;
          const endTime = `${String(Math.floor(endMinutes / 60)).padStart(
            2,
            "0"
          )}:${String(endMinutes % 60).padStart(2, "0")}`;

          availableSlots.push({ startTime, endTime });
        }
      }
    }

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Available slots retrieved successfully.",
      {
        date,
        serviceDuration: duration,
        availableSlots
      }
    );
  } catch (error) {
    console.error("Get available slots error:", error);
    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to retrieve available slots."
    );
  }
};

const bookAppointment = async (req, res) => {
  try {
    const {
      therapistId,
      serviceId,
      appointmentDate,
      notes = "",
      consentGiven
    } = req.body;

    if (
      !mongoose.isValidObjectId(therapistId) ||
      !mongoose.isValidObjectId(serviceId) ||
      !appointmentDate
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide valid therapist ID, service ID, and appointment date."
      );
    }

    const start = new Date(appointmentDate);

    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide a valid future appointment date and time."
      );
    }

    const userId = req.user?._id || req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return responseHandler(
        res,
        StatusCode.UNAUTHORIZED,
        "Please log in before booking an appointment."
      );
    }

    const [patient, therapist, service] = await Promise.all([
      Patient.findOne({ user: userId }),
      Therapist.findById(therapistId),
      Service.findOne({ _id: serviceId, isActive: true })
    ]);

    if (!patient) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Patient profile not found."
      );
    }

    if (!therapist || therapist.inactive) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Therapist not found or inactive."
      );
    }

    if (!service) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Active service not found."
      );
    }

    const end = new Date(start.getTime() + service.duration * 60 * 1000);

    const dayOfWeek = start.getDay();
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const fitsSchedule = (therapist.availability || []).some((shift) => {
      return (
        shift.dayOfWeek === dayOfWeek &&
        timeToMinutes(shift.startTime) <= startMinutes &&
        timeToMinutes(shift.endTime) >= endMinutes &&
        start.toDateString() === end.toDateString()
      );
    });

    if (!fitsSchedule) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "The selected time is outside the therapist's working hours."
      );
    }

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await Holidays.findOne({
      date: { $gte: dayStart, $lt: nextDay },
      $or: [
        { scope: "clinic" },
        { scope: "therapist", therapist: therapistId }
      ]
    });

    if (holiday) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Appointments are unavailable on this holiday."
      );
    }

    // Acquire lock before checking overlaps and creating the appointment.
    const dateKey = getDateKey(start);
    const lockToken = await acquireAppointmentLock(therapistId, dateKey);

    if (!lockToken) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Another booking is being processed for this therapist. Please try again."
      );
    }

    try {
      const overlap = await findOverlappingAppointments(
        therapistId,
        start,
        end
      );

      if (overlap.length > 0) {
        return responseHandler(
          res,
          StatusCode.CONFLICT,
          "This time slot is already booked."
        );
      }

      const appointment = await Appointment.create({
        patient: patient._id,
        therapist: therapist._id,
        service: service._id,
        appointmentDate: start,
        appointmentEnd: end,
        notes,
        consentGiven,
        status: "pending"
      });

      return responseHandler(
        res,
        StatusCode.SUCCESS,
        "Appointment booked successfully.",
        appointment
      );
    } finally {
      try {
        await releaseAppointmentLock(therapistId, dateKey, lockToken);
      } catch (releaseError) {
        console.error("Failed to release appointment lock:", releaseError);
      }
    }
  } catch (error) {
    if (error.code === 11000) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This time slot is already booked."
      );
    }

    console.error("Book appointment error:", error);
    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to book appointment."
    );
  }
};

const bookGuestAppointment = async (req, res) => {
  try {
    const {
      therapistId,
      serviceId,
      appointmentDate,
      guestName,
      guestEmail,
      guestPhone,
      consentGiven,
      notes = ""
    } = req.body;

    if (consentGiven !== true) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Consent is required to book an appointment."
      );
    }

    const start = new Date(appointmentDate);

    if (
      Number.isNaN(start.getTime()) ||
      start <= new Date() ||
      start.getSeconds() !== 0 ||
      start.getMilliseconds() !== 0
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide a valid future appointment time."
      );
    }

    const [therapist, service] = await Promise.all([
      Therapist.findById(therapistId),
      Service.findOne({ _id: serviceId, isActive: true })
    ]);

    if (!therapist || therapist.inactive) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Therapist not found or inactive."
      );
    }

    if (!service) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Active service not found."
      );
    }

    const date = [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, "0"),
      String(start.getDate()).padStart(2, "0")
    ].join("-");

    const startTime =
      `${String(start.getHours()).padStart(2, "0")}:` +
      `${String(start.getMinutes()).padStart(2, "0")}`;

    const end = new Date(
      start.getTime() + service.duration * 60 * 1000
    );

    const dayOfWeek = start.getDay();
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + service.duration;

    const matchingShifts = (therapist.availability || []).filter(
      (shift) =>
        shift.dayOfWeek === dayOfWeek &&
        timeToMinutes(shift.startTime) <= startMinutes &&
        timeToMinutes(shift.endTime) >= endMinutes &&
        start.toDateString() === end.toDateString()
    );

    if (!matchingShifts.length) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "The selected time is outside the therapist's working hours."
      );
    }

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await Holidays.findOne({
      date: { $gte: dayStart, $lt: nextDay },
      $or: [
        { scope: "clinic" },
        { scope: "therapist", therapist: therapistId }
      ]
    });

    if (holiday) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Appointments are unavailable on this holiday."
      );
    }

    // Acquire lock before checking availability and creating the appointment.
    const dateKey = getDateKey(start);
    const lockToken = await acquireAppointmentLock(therapistId, dateKey);

    if (!lockToken) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Another booking is being processed for this therapist. Please try again."
      );
    }

    let appointment;

    try {
      const existingAppointments = await Appointment.find({
        therapist: therapistId,
        status: { $in: ["pending", "confirmed"] },
        appointmentDate: { $lt: nextDay },
        $or: [
          { appointmentEnd: { $gt: dayStart } },
          {
            appointmentEnd: { $exists: false },
            appointmentDate: { $gte: dayStart }
          }
        ]
      });

      const bookedSlots = existingAppointments.map((existingAppointment) => {
        const bookedStart = existingAppointment.appointmentDate;

        return (
          `${String(bookedStart.getHours()).padStart(2, "0")}:` +
          `${String(bookedStart.getMinutes()).padStart(2, "0")}`
        );
      });

      const availableTimes = matchingShifts.flatMap((shift) =>
        generateSlots({
          date,
          workStart: shift.startTime,
          workEnd: shift.endTime,
          sessionMinutes: service.duration,
          bookedSlots,
          now: new Date()
        })
      );

      if (!availableTimes.includes(startTime)) {
        return responseHandler(
          res,
          StatusCode.CONFLICT,
          "This time slot is no longer available."
        );
      }

      const overlap = await findOverlappingAppointments(
        therapistId,
        start,
        end
      );

      if (overlap.length > 0) {
        return responseHandler(
          res,
          StatusCode.CONFLICT,
          "This time slot is already booked."
        );
      }

      appointment = await Appointment.create({
        guestName,
        guestEmail,
        guestPhone,
        therapist: therapist._id,
        service: service._id,
        appointmentDate: start,
        appointmentEnd: end,
        notes,
        consentGiven: true,
        status: "pending"
      });
    } finally {
      try {
        await releaseAppointmentLock(therapistId, dateKey, lockToken);
      } catch (releaseError) {
        console.error("Failed to release appointment lock:", releaseError);
      }
    }

    // Send email after releasing the booking lock.
    try {
      await sendGuestBookingConfirmation(appointment);
    } catch (emailError) {
      console.error(
        "Appointment saved, but confirmation email failed:",
        emailError.message
      );
    }

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Guest appointment booked successfully.",
      appointment
    );
  } catch (error) {
    if (error.code === 11000) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This time slot is already booked."
      );
    }

    console.error("Guest booking error:", error);
    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to book guest appointment."
    );
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid appointment ID."
      );
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Appointment not found."
      );
    }
    if (req.user.role !== "admin") {
      const userId = req.user?._id || req.user?.id;
      const patient = await Patient.findOne({ user: userId });

      if (
        !patient ||
        !appointment.patient ||
        appointment.patient.toString() !== patient._id.toString()
      ) {
        return responseHandler(
          res,
          StatusCode.NOT_FOUND,
          "You are not allowed to cancel this appointment."
        );
      }
    }

    if (!["pending", "confirmed"].includes(appointment.status)) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This appointment cannot be cancelled in its current status."
      );
    }

    appointment.status = "cancelled";
    await appointment.save();

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Appointment cancelled successfully.",
      appointment
    );
  } catch (error) {
    console.error("Cancel appointment error:", error.message);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to cancel appointment."
    );
  }
};

const rescheduleAppointment = async (req, res) => {
  let lockToken = null;
  let therapistId = null;
  let dateKey = null;

  try {
    const { id } = req.params;
    const { appointmentDate } = req.body;

    if (!mongoose.isValidObjectId(id) || !appointmentDate) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide a valid appointment ID and new appointment date."
      );
    }

    const start = new Date(appointmentDate);

    if (
      Number.isNaN(start.getTime()) ||
      start <= new Date() ||
      start.getSeconds() !== 0 ||
      start.getMilliseconds() !== 0
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide a valid future appointment time."
      );
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Appointment not found."
      );
    }

    // Admins can reschedule any appointment.
    // Patients can reschedule only their own appointments.
    if (req.user?.role !== "admin") {
      const userId = req.user?._id || req.user?.id;
      const patient = userId
        ? await Patient.findOne({ user: userId })
        : null;

      if (
        !patient ||
        !appointment.patient ||
        appointment.patient.toString() !== patient._id.toString()
      ) {
        return responseHandler(
          res,
          StatusCode.NOT_FOUND,
          "You are not allowed to reschedule this appointment."
        );
      }
    }

    if (!["pending", "confirmed"].includes(appointment.status)) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This appointment cannot be rescheduled in its current status."
      );
    }

    therapistId = appointment.therapist;
    const service = await Service.findById(appointment.service);
    const therapist = await Therapist.findById(therapistId);

    if (!service || !service.isActive) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "The appointment service is no longer active."
      );
    }

    if (!therapist || therapist.inactive) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Therapist not found or inactive."
      );
    }

    const end = new Date(
      start.getTime() + service.duration * 60 * 1000
    );

    const dayOfWeek = start.getDay();
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const fitsSchedule = (therapist.availability || []).some((shift) => {
      return (
        shift.dayOfWeek === dayOfWeek &&
        timeToMinutes(shift.startTime) <= startMinutes &&
        timeToMinutes(shift.endTime) >= endMinutes &&
        start.toDateString() === end.toDateString()
      );
    });

    if (!fitsSchedule) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "The selected time is outside the therapist's working hours."
      );
    }

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await Holidays.findOne({
      date: { $gte: dayStart, $lt: nextDay },
      $or: [
        { scope: "clinic" },
        { scope: "therapist", therapist: therapistId }
      ]
    });

    if (holiday) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Appointments are unavailable on this holiday."
      );
    }

    // Lock the therapist's target date before checking availability.
    dateKey = getDateKey(start);
    lockToken = await acquireAppointmentLock(therapistId, dateKey);

    if (!lockToken) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Another booking is being processed for this therapist. Please try again."
      );
    }

    const overlap = await findOverlappingAppointments(
      therapistId,
      start,
      end,
      null,
      appointment._id
    );

    if (overlap.length > 0) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This time slot is already booked."
      );
    }

    appointment.appointmentDate = start;
    appointment.appointmentEnd = end;

    await appointment.save();

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Appointment rescheduled successfully.",
      appointment
    );
  } catch (error) {
    if (error.code === 11000) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This time slot is already booked."
      );
    }

    console.error("Reschedule appointment error:", error);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to reschedule appointment."
    );
  } finally {
    if (lockToken && therapistId && dateKey) {
      try {
        await releaseAppointmentLock(
          therapistId,
          dateKey,
          lockToken
        );
      } catch (releaseError) {
        console.error(
          "Failed to release rescheduling lock:",
          releaseError
        );
      }
    }
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid appointment ID."
      );
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no-show"
    ];

    if (!allowedStatuses.includes(status)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid appointment status."
      );
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Appointment not found."
      );
    }

    appointment.status = status;
    await appointment.save();

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Appointment status updated successfully.",
      appointment
    );
  } catch (error) {
    console.error("Update appointment status error:", error.message);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to update appointment status."
    );
  }
};


module.exports = {
  getAvailableSlots,
  bookAppointment,
  bookGuestAppointment,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus
};
