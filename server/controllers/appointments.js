const mongoose = require("mongoose");
const crypto = require("crypto");

const responseHandler = require("../utils/responseHandler");
const { StatusCode } = require("../consts/statusCode");
const { generateSlots } = require("../utils/slots");

const Patient = require("../models/patient");
const Therapist = require("../models/therapist");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const Holidays = require("../models/holiday");
const AppointmentLock = require("../models/appointmentLock");
const User = require("../models/User");

const { sendBookingConfirmation } = require("../emails/bookingConfirmation");

const ACTIVE_APPOINTMENT_STATUSES = ["pending", "confirmed"];
const CLINIC_TIME_ZONE = "Asia/Karachi";
const LOCK_DURATION_MS = 5 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function buildDateTime(date, time) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(date) {
  return getLocalDateString(date);
}

function isValidDateString(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function formatEmailDate(date) {
  return date.toLocaleDateString("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEmailTime(date) {
  return date.toLocaleTimeString("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* -------------------------------------------------------------------------- */
/*                              Email Confirmation                            */
/* -------------------------------------------------------------------------- */

// A booking should remain saved even if sending the email fails.
async function sendConfirmationSafely({
  recipient,
  patientName,
  service,
  therapist,
  appointment,
}) {
  if (!recipient) {
    console.warn(
      "Appointment saved, but no recipient email is available."
    );
    return;
  }

  try {
    await sendBookingConfirmation(recipient, {
      patientName: patientName || "Patient",
      serviceTitle: service.name,
      therapistName:
        therapist.name ||
        therapist.fullName ||
        "Selected physiotherapist",
      date: formatEmailDate(appointment.appointmentDate),
      slot: formatEmailTime(appointment.appointmentDate),
      status: appointment.status,
    });
  } catch (emailError) {
    console.error(
      "Appointment saved, but confirmation email failed:",
      emailError.message
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                           Appointment Queries                             */
/* -------------------------------------------------------------------------- */

async function findOverlappingAppointments(
  therapistId,
  start,
  end,
  session = null,
  excludeAppointmentId = null
) {
  const filter = {
    therapist: therapistId,
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    appointmentDate: { $lt: end },
    $or: [
      { appointmentEnd: { $gt: start } },
      {
        appointmentEnd: { $exists: false },
        appointmentDate: { $gte: start },
      },
    ],
  };

  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }

  const query = Appointment.find(filter);

  if (session) {
    query.session(session);
  }

  return query;
}
async function getActiveAppointmentsForDay(
  therapistId,
  date,
  excludeAppointmentId = null
) {
  const dayStart = buildDateTime(date, "00:00");
  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  const filter = {
    therapist: therapistId,
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    appointmentDate: { $lt: nextDay },
    $or: [
      { appointmentEnd: { $gt: dayStart } },
      {
        appointmentEnd: { $exists: false },
        appointmentDate: { $gte: dayStart },
      },
    ],
  };

  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }

  return Appointment.find(filter);
}

/* -------------------------------------------------------------------------- */
/*                               Holiday Checks                               */
/* -------------------------------------------------------------------------- */

async function isClinicOrTherapistHoliday(therapistId, date) {
  const dayStart = buildDateTime(date, "00:00");
  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  const holiday = await Holidays.findOne({
    date: { $gte: dayStart, $lt: nextDay },
    $or: [
      { scope: "clinic" },
      { scope: "therapist", therapist: therapistId },
    ],
  });

  return Boolean(holiday);
}

/* -------------------------------------------------------------------------- */
/*                            Appointment Locking                             */
/* -------------------------------------------------------------------------- */

async function acquireAppointmentLock(therapistId, dateKey) {
  const now = new Date();
  const lockToken = crypto.randomUUID();

  try {
    const lock = await AppointmentLock.findOneAndUpdate(
      {
        therapist: therapistId,
        dateKey,
        lockedUntil: { $lte: now },
      },
      {
        $set: {
          lockToken,
          lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS),
        },
        $setOnInsert: {
          therapist: therapistId,
          dateKey,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!lock) {
      return null;
    }

    return lockToken;
  } catch (error) {
    // A duplicate-key error means another request already holds this lock.
    if (error.code === 11000) {
      return null;
    }

    throw error;
  }
}

async function releaseAppointmentLock(therapistId, dateKey, lockToken) {
  await AppointmentLock.deleteOne({
    therapist: therapistId,
    dateKey,
    lockToken,
  });
}

/* -------------------------------------------------------------------------- */
/*                         Selected Slot Validation                          */
/* -------------------------------------------------------------------------- */

async function validateSelectedSlot({ therapist, service, start, excludeAppointmentId = null })  {
  if (!mongoose.isValidObjectId(therapist._id)) {
    return { error: "Invalid therapist." };
  }


const duration = service.duration;

if (
  !Number.isSafeInteger(duration) ||
  duration < 1 ||
  typeof service.price !== "number" ||
  !Number.isFinite(service.price) ||
  service.price < 0
) {
  return {
    error: "This service is not configured for online booking yet. Please contact the clinic.",
  };
}


  if (
    !(start instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    start.getSeconds() !== 0 ||
    start.getMilliseconds() !== 0 ||
    start <= new Date()
  ) {
    return {
      error: "Please provide a valid future appointment time.",
    };
  }

  const date = getLocalDateString(start);
  const startTime = formatTime(start);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const dayOfWeek = start.getDay();

  const matchingShifts = (therapist.availability || []).filter(
    (shift) =>
      shift.dayOfWeek === dayOfWeek &&
      timeToMinutes(shift.startTime) <= timeToMinutes(startTime) &&
      timeToMinutes(shift.endTime) >=
        timeToMinutes(startTime) + duration &&
      start.toDateString() === end.toDateString()
  );

  if (!matchingShifts.length) {
    return {
      error: "The selected time is outside the therapist's working hours.",
    };
  }

  if (await isClinicOrTherapistHoliday(therapist._id, date)) {
    return {
      conflict: true,
      error: "Appointments are unavailable on this holiday.",
    };
  }

  const appointments = await getActiveAppointmentsForDay(
    therapist._id,
    date,
    excludeAppointmentId
  );

  const bookedSlots = appointments.map((item) =>
    formatTime(item.appointmentDate)
  );

  const availableTimes = matchingShifts.flatMap((shift) =>
    generateSlots({
      date,
      workStart: shift.startTime,
      workEnd: shift.endTime,
      sessionMinutes: duration,
      breaks: shift.breaks || [],
      bookedSlots,
      now: new Date(),
    })
  );

  if (!availableTimes.includes(startTime)) {
    return {
      conflict: true,
      error: "This time slot is no longer available.",
    };
  }

  const overlaps = await findOverlappingAppointments(
    therapist._id,
    start,
    end,
    excludeAppointmentId
  );

  if (overlaps.length > 0) {
    return {
      conflict: true,
      error: "This time slot is already booked.",
    };
  }

  return { end };
}

/* -------------------------------------------------------------------------- */
/*                             Get Available Slots                            */
/* -------------------------------------------------------------------------- */

const getAvailableSlots = async (req, res) => {
  try {
    console.log("Backend timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    const { therapistId, serviceId, date } = req.query;

    if (
      !mongoose.isValidObjectId(therapistId) ||
      !mongoose.isValidObjectId(serviceId) ||
      !isValidDateString(date)
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide valid therapist ID, service ID, and date in YYYY-MM-DD format."
      );
    }

    const requestedDay = buildDateTime(date, "12:00").getDay();

    const [therapist, service] = await Promise.all([
      Therapist.findById(therapistId),
      Service.findOne({ _id: serviceId, isActive: true }),
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

    const schedule = (therapist.availability || []).filter(
      (shift) => shift.dayOfWeek === requestedDay
    );

    if (
      schedule.length === 0 ||
      (await isClinicOrTherapistHoliday(therapist._id, date))
    ) {
      return responseHandler(
        res,
        StatusCode.SUCCESS,
        "Available slots retrieved successfully.",
        {
          date,
          serviceDuration: service.duration,
          availableSlots: [],
        }
      );
    }

    const appointments = await getActiveAppointmentsForDay(
      therapist._id,
      date,
    );

    const bookedSlots = appointments.map((item) =>
      formatTime(item.appointmentDate)
    );

    const slotsByStartTime = new Map();

    for (const shift of schedule) {
      const generatedTimes = generateSlots({
        date,
        workStart: shift.startTime,
        workEnd: shift.endTime,
        sessionMinutes: service.duration,
        breaks: shift.breaks || [],
        bookedSlots,
        now: new Date(),
      });

      for (const startTime of generatedTimes) {
        const start = buildDateTime(date, startTime);
        const end = new Date(
          start.getTime() + service.duration * 60 * 1000
        );

        const isBooked = appointments.some((appointment) => {
          const existingStart = appointment.appointmentDate;
          const existingEnd = appointment.appointmentEnd;

          if (!existingEnd) {
            return existingStart >= start && existingStart < end;
          }

          return existingStart < end && existingEnd > start;
        });

        if (!isBooked) {
          const endMinutes = timeToMinutes(startTime) + service.duration;
          const endTime = `${String(
            Math.floor(endMinutes / 60)
          ).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

          slotsByStartTime.set(startTime, {
            startTime,
            endTime,
          });
        }
      }
    }

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Available slots retrieved successfully.",
      {
        date,
        serviceDuration: service.duration,
        availableSlots: [...slotsByStartTime.values()].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        ),
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

/* -------------------------------------------------------------------------- */
/*                          Logged-in Patient Booking                        */
/* -------------------------------------------------------------------------- */

const bookAppointment = async (req, res) => {
  let lockToken = null;
  let lockTherapistId = null;
  let lockDateKey = null;

  try {
    const {
      therapistId,
      serviceId,
      appointmentDate,
      notes = "",
      consentGiven,
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

    const userId = req.user?._id || req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return responseHandler(
        res,
        StatusCode.UNAUTHORIZED,
        "Please log in before booking an appointment."
      );
    }

    const [patient, therapist, service, user] = await Promise.all([
      Patient.findOne({ user: userId }),
      Therapist.findById(therapistId),
      Service.findOne({ _id: serviceId, isActive: true }),
      User.findById(userId).select("name email"),
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

    // Acquire the lock before validating and creating the appointment.
    lockTherapistId = therapist._id;
    lockDateKey = getDateKey(start);

    lockToken = await acquireAppointmentLock(
      lockTherapistId,
      lockDateKey
    );

    if (!lockToken) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Another booking is being processed for this therapist. Please try again."
      );
    }

    const slotResult = await validateSelectedSlot({
      therapist,
      service,
      start,
    });

    if (slotResult.error) {
      return responseHandler(
        res,
        slotResult.conflict
          ? StatusCode.CONFLICT
          : StatusCode.BAD_REQUEST,
        slotResult.error
      );
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      therapist: therapist._id,
      service: service._id,
      appointmentDate: start,
      appointmentEnd: slotResult.end,
      notes,
      consentGiven: true,
      status: "pending",
    });

    // Email failure must not undo a successfully saved appointment.
    await sendConfirmationSafely({
      recipient: user?.email,
      patientName: user?.name,
      service,
      therapist,
      appointment,
    });

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Appointment booked successfully.",
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

    console.error("Book appointment error:", error);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to book appointment."
    );
  } finally {
    if (lockToken && lockTherapistId && lockDateKey) {
      try {
        await releaseAppointmentLock(
          lockTherapistId,
          lockDateKey,
          lockToken
        );
      } catch (releaseError) {
        console.error(
          "Failed to release appointment lock:",
          releaseError
        );
      }
    }
  }
};

/* -------------------------------------------------------------------------- */
/*                              Guest Booking                                 */
/* -------------------------------------------------------------------------- */

const bookGuestAppointment = async (req, res) => {
  let lockToken = null;
  let lockTherapistId = null;
  let lockDateKey = null;

  try {
    const {
      therapistId,
      serviceId,
      appointmentDate,
      guestName,
      guestEmail,
      guestPhone,
      consentGiven,
      notes = "",
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

    if (consentGiven !== true) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Consent is required to book an appointment."
      );
    }

    if (
      typeof guestName !== "string" ||
      !guestName.trim() ||
      typeof guestEmail !== "string" ||
      !guestEmail.trim() ||
      typeof guestPhone !== "string" ||
      !guestPhone.trim()
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Guest name, email, and phone number are required."
      );
    }

    const normalizedName = guestName.trim();
    const normalizedEmail = guestEmail.trim().toLowerCase();
    const normalizedPhone = guestPhone.trim();

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
      Service.findOne({ _id: serviceId, isActive: true }),
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

if (
  !Number.isSafeInteger(service.duration) ||
  service.duration < 1 ||
  typeof service.price !== "number" ||
  !Number.isFinite(service.price) ||
  service.price < 0
) {
  return responseHandler(
    res,
    StatusCode.BAD_REQUEST,
    "This service is not configured for online booking yet. Please contact the clinic."
  );
}


    // Use the same lock mechanism for guest bookings.
    lockTherapistId = therapist._id;
    lockDateKey = getDateKey(start);

    lockToken = await acquireAppointmentLock(
      lockTherapistId,
      lockDateKey
    );

    if (!lockToken) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Another booking is being processed for this therapist. Please try again."
      );
    }

    const slotResult = await validateSelectedSlot({
      therapist,
      service,
      start,
    });

    if (slotResult.error) {
      return responseHandler(
        res,
        slotResult.conflict
          ? StatusCode.CONFLICT
          : StatusCode.BAD_REQUEST,
        slotResult.error
      );
    }

    const appointment = await Appointment.create({
      guestName: normalizedName,
      guestEmail: normalizedEmail,
      guestPhone: normalizedPhone,
      therapist: therapist._id,
      service: service._id,
      appointmentDate: start,
      appointmentEnd: slotResult.end,
      notes,
      consentGiven: true,
      status: "pending",
    });

    await sendConfirmationSafely({
      recipient: normalizedEmail,
      patientName: normalizedName,
      service,
      therapist,
      appointment,
    });

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
  }finally {
    if (lockToken && lockTherapistId && lockDateKey) {
      try {
        await releaseAppointmentLock(
          lockTherapistId,
          lockDateKey,
          lockToken
        );
      } catch (releaseError) {
        console.error(
          "Failed to release appointment lock:",
          releaseError
        );
      }
    }
  }
};


const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { guestEmail, guestPhone } = req.body || {};

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

    // Admins can cancel any appointment.
    if (req.user?.role !== "admin") {
      if (appointment.patient) {
        // Registered patient ownership check.
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
          return responseHandler(
            res,
            StatusCode.UNAUTHORIZED,
            "Please log in to cancel this appointment."
          );
        }

        const patient = await Patient.findOne({ user: userId });

        if (
          !patient ||
          appointment.patient.toString() !== patient._id.toString()
        ) {
          return responseHandler(
            res,
            StatusCode.NOT_FOUND,
            "Appointment not found."
          );
        }
      } else {
        // Temporary guest ownership check.
        const email = String(guestEmail || "").trim().toLowerCase();
        const phone = String(guestPhone || "").trim();

        if (
          !email ||
          !phone ||
          email !== appointment.guestEmail ||
          phone !== appointment.guestPhone
        ) {
          return responseHandler(
            res,
            StatusCode.NOT_FOUND,
            "Appointment not found."
          );
        }
      }
    }

    if (!ACTIVE_APPOINTMENT_STATUSES.includes(appointment.status)) {
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
    console.error("Cancel appointment error:", error);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to cancel appointment."
    );
  }
};

const rescheduleAppointment = async (req, res) => {
  let lockToken = null;
  let lockTherapistId = null;
  let lockDateKey = null;

  try {
    const { id } = req.params;
    const { appointmentDate, guestEmail, guestPhone } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid appointment ID."
      );
    }

    if (!appointmentDate) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Please provide a new appointment date and time."
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
    if (req.user?.role !== "admin") {
      if (appointment.patient) {
        // Registered patient ownership check.
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
          return responseHandler(
            res,
            StatusCode.UNAUTHORIZED,
            "Please log in to reschedule this appointment."
          );
        }

        const patient = await Patient.findOne({ user: userId });

        if (
          !patient ||
          appointment.patient.toString() !== patient._id.toString()
        ) {
          return responseHandler(
            res,
            StatusCode.NOT_FOUND,
            "Appointment not found."
          );
        }
      } else {
        // Temporary guest ownership check.
        const email = String(guestEmail || "").trim().toLowerCase();
        const phone = String(guestPhone || "").trim();

        if (
          !email ||
          !phone ||
          email !== appointment.guestEmail ||
          phone !== appointment.guestPhone
        ) {
          return responseHandler(
            res,
            StatusCode.NOT_FOUND,
            "Appointment not found."
          );
        }
      }
    }

    if (!ACTIVE_APPOINTMENT_STATUSES.includes(appointment.status)) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "This appointment cannot be rescheduled in its current status."
      );
    }

    const [therapist, service] = await Promise.all([
      Therapist.findById(appointment.therapist),
      Service.findOne({
        _id: appointment.service,
        isActive: true,
      }),
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
        "The original appointment service is no longer available."
      );
    }

    // Lock the new appointment date before checking availability.
    lockTherapistId = therapist._id;
    lockDateKey = getDateKey(start);

    lockToken = await acquireAppointmentLock(
      lockTherapistId,
      lockDateKey
    );

    if (!lockToken) {
      return responseHandler(
        res,
        StatusCode.CONFLICT,
        "Another booking is being processed for this therapist. Please try again."
      );
    }

    // Exclude this appointment from the availability check.
    const slotResult = await validateSelectedSlot({
      therapist,
      service,
      start,
      excludeAppointmentId: appointment._id,
    });

    if (slotResult.error) {
      return responseHandler(
        res,
        slotResult.conflict
          ? StatusCode.CONFLICT
          : StatusCode.BAD_REQUEST,
        slotResult.error
      );
    }

    appointment.appointmentDate = start;
    appointment.appointmentEnd = slotResult.end;

    await appointment.save();

    // Send an updated confirmation email without undoing the reschedule
    // if email delivery fails.
    const userId = req.user?._id || req.user?.id;
    const user = appointment.patient && userId
      ? await User.findById(userId).select("name email")
      : null;

    await sendConfirmationSafely({
      recipient: appointment.guestEmail || user?.email,
      patientName: appointment.guestName || user?.name,
      service,
      therapist,
      appointment,
    });

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
    if (lockToken && lockTherapistId && lockDateKey) {
      try {
        await releaseAppointmentLock(
          lockTherapistId,
          lockDateKey,
          lockToken
        );
      } catch (releaseError) {
        console.error(
          "Failed to release appointment lock:",
          releaseError
        );
      }
    }
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

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
      "no-show",
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
    console.error("Update appointment status error:", error);

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to update appointment status."
    );
  }
};


module.exports = {getAvailableSlots,bookAppointment,bookGuestAppointment,cancelAppointment, rescheduleAppointment, updateAppointmentStatus};