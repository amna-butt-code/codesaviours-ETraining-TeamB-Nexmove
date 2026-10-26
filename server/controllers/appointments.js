const mongoose = require("mongoose");
const responseHandler = require("../utils/responseHandler");
const {StatusCode} = require("../consts/statusCode");

const patient = require("../models/patient");
const therapist = require("../models/therapist");
const service = require("../models/service");
const appointment = require("../models/appointment");
const holidays = require("../models/holiday");



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
  session = null
) => {
  const query = appointment.find({
    therapist: therapistId,
    status: { $nin: ["cancelled"] },
    appointmentDate: { $lt: end },
    $or: [
      { appointmentEnd: { $gt: start } },
      {
        appointmentEnd: { $exists: false },
        appointmentDate: { $gte: start }
      }
    ]
  });

  if (session) query.session(session);

  return query;
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
      return responseHandler(res,StatusCode.BAD_REQUEST, "Please provide valid therapist ID, service ID, and date in YYYY-MM-DD format.");
    }

    const requestedDay = new Date(`${date}T12:00:00`).getDay();

    const [therapistRecord, serviceRecord] = await Promise.all([
  therapist.findById(therapistId),
  service.findOne({ _id: serviceId, isActive: true })
]);

    if (!therapistRecord  || therapistRecord.inactive) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Therapist not found or inactive." );
    }

    if (!serviceRecord) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Active service not found." );
    }

    const schedule = (therapistRecord.availability || []).filter(
      (item) => item.dayOfWeek === requestedDay
    );

    if (!schedule.length) {
      return responseHandler(res, StatusCode.SUCCESS, {
        date,
        serviceDuration: serviceRecord.duration,
        availableSlots: []
      });
    }

    const dayStart = buildDateTime(date, "00:00");
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const holidays = await holidays.find({
      date: { $gte: dayStart, $lt: nextDay },
      $or: [
        { scope: "clinic" },
        { scope: "therapist", therapist: therapistId }
      ]
    });

    if (holidays.length) {
      return responseHandler(res, StatusCode.SUCCESS, "Appointments are unavailable on this holiday.", {
        date,
        serviceDuration: service.duration,
        availableSlots: []
      });
    }

    const appointments = await Appointment.find({
      therapist: therapistId,
      status: { $nin: ["cancelled"] },
      appointmentDate: { $lt: nextDay },
      $or: [
        { appointmentEnd: { $gt: dayStart } },
        {
          appointmentEnd: { $exists: false },
          appointmentDate: { $gte: dayStart }
        }
      ]
    });

    const now = new Date();
    const availableSlots = [];
    const duration = service.duration;

    for (const shift of schedule) {
      const shiftStart = timeToMinutes(shift.startTime);
      const shiftEnd = timeToMinutes(shift.endTime);

      if (shiftEnd <= shiftStart) continue;

      for (
        let startMinutes = shiftStart;
        startMinutes + duration <= shiftEnd;
        startMinutes += duration
      ) {
        const endMinutes = startMinutes + duration;

        const startTime = `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}`;
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

        const start = buildDateTime(date, startTime);
        const end = buildDateTime(date, endTime);

        if (start <= now) continue;

        const isBooked = appointments.some((appointment) => {
          const existingStart = appointment.appointmentDate;
          const existingEnd = appointment.appointmentEnd;

          if (!existingEnd) {
            return existingStart >= start && existingStart < end;
          }

          return existingStart < end && existingEnd > start;
        });

        if (!isBooked) {
          availableSlots.push({ startTime, endTime });
        }
      }
    }

    return responseHandler(res, 200, {
      date,
      serviceDuration: duration,
      availableSlots
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    return responseHandler(res, StatusCode.SERVER_ERROR,"Failed to retrieve available slots.");
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { therapistId, serviceId, appointmentDate, notes = "" } = req.body;

    if (
      !mongoose.isValidObjectId(therapistId) ||
      !mongoose.isValidObjectId(serviceId) ||
      !appointmentDate
    ) {
      return responseHandler(res, StatusCode.BAD_REQUEST,"Please provide valid therapist ID, service ID, and appointment date.");
    }

    const start = new Date(appointmentDate);

    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      return responseHandler(res, StatusCode.BAD_REQUEST,  "Please provide a valid future appointment date and time.");
    }

    const userId = req.user?._id || req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return responseHandler(res, StatusCode.UNAUTHORIZED, "Please log in before booking an appointment.");
    }

    const [patient, therapist, service] = await Promise.all([
      Patient.findOne({ user: userId }),
      Therapist.findById(therapistId),
      Service.findOne({ _id: serviceId, isActive: true })
    ]);

    if (!patient) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Patient profile not found.");;
    }

    if (!therapist || therapist.inactive) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Therapist not found or inactive.");
    }

    if (!service) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Active service not found.");
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
      return responseHandler(res, StatusCode.BAD_REQUEST, "The selected time is outside the therapist's working hours.");
    }

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await Holiday.findOne({
      date: { $gte: dayStart, $lt: nextDay },
      $or: [
        { scope: "clinic" },
        { scope: "therapist", therapist: therapistId }
      ]
    });

    if (holiday) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Appointments are unavailable on this holiday.");
    }

    const overlap = await findOverlappingAppointments(
      therapistId,
      start,
      end
    );

    if (overlap.length > 0) {
      return responseHandler(res, StatusCode.ALREADY_EXIST, "This time slot is already booked.");
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      therapist: therapist._id,
      service: service._id,
      appointmentDate: start,
      appointmentEnd: end,
      notes,
      status: "pending"
    });

    return responseHandler(res, StatusCode.SUCCESS, "Appointment booked successfully.", appointment);
  } catch (error) {
    console.error("Book appointment error:", error);
    return responseHandler(res, StatusCode.SERVER_ERROR, "Failed to book appointment.");
  }
};

module.exports = {getAvailableSlots,bookAppointment};