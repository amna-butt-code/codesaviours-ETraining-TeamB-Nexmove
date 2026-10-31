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


const TIME_ZONE_OFFSET = "+05:00";
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeToMinutes(time) {
    if (typeof time !== "string" || !TIME_PATTERN.test(time)) {
        return NaN;
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function buildDateTime(date, time) {
    if (
        !isValidDateString(date) ||
        typeof time !== "string" ||
        !TIME_PATTERN.test(time)
    ) {
        return new Date(NaN);
    }

    return new Date(
        `${date}T${time}:00${TIME_ZONE_OFFSET}`
    );
}

function getLocalDateString(date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: CLINIC_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

function getDateKey(date) {
    return getLocalDateString(date);
}

function isValidDateString(date) {
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
    );
}

function formatTime(date) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: CLINIC_TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(date);
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
  session = null
) {
  const query = Appointment.find({
    therapist: therapistId,
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    appointmentDate: { $lt: end },
    $or: [
      { appointmentEnd: { $gt: start } },
      {
        appointmentEnd: { $exists: false },
        appointmentDate: { $gte: start }
      }
    ]
  });

  if (session) {
    query.session(session);
  }

  return query;
}

async function getActiveAppointmentsForDay(therapistId, date) {
  const dayStart = buildDateTime(date, "00:00");
  const nextDay = new Date(dayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  return Appointment.find({
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
  });
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

async function validateSelectedSlot({ therapist, service, start }) {
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
  const dayOfWeek = buildDateTime(date, "12:00").getUTCDay();

  const matchingShifts = (therapist.availability || []).filter(
    (shift) =>
      shift.dayOfWeek === dayOfWeek &&
      timeToMinutes(shift.startTime) <= timeToMinutes(startTime) &&
      timeToMinutes(shift.endTime) >=
        timeToMinutes(startTime) + duration &&
      getLocalDateString(start) === getLocalDateString(end)
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
    date
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
    end
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

    const requestedDay = buildDateTime(date, "12:00").getUTCDay();

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
      date
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
  }
};

module.exports = {
  getAvailableSlots,
  bookAppointment,
  bookGuestAppointment
};
