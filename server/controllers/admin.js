const Appointment = require("../models/appointment");
const Patient = require("../models/patient");
const responseHandler = require("../utils/responseHandler");
const { StatusCode } = require("../consts/statusCode");

const getAdminStats = async (req, res) => {
  try {
    const today = new Date();

    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(today);

    const dateValues = {};
    dateParts.forEach(({ type, value }) => {
      dateValues[type] = value;
    });

    const year = Number(dateValues.year);
    const month = Number(dateValues.month);
    const day = Number(dateValues.day);

    const startOfDay = new Date(
      Date.UTC(year, month - 1, day) - 5 * 60 * 60 * 1000
    );

    const endOfDay = new Date(
      startOfDay.getTime() + 24 * 60 * 60 * 1000
    );

    const [
      todaysAppointments,
      newBookings,
      totalPatients,
      revenueAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({
        appointmentDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      }),

      Appointment.countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      }),

      Patient.countDocuments(),

      Appointment.find({
        appointmentDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        status: { $in: ["pending", "confirmed", "completed"] },
      }).populate("service", "price"),
    ]);

    const revenueEstimate = revenueAppointments.reduce(
      (total, appointment) => {
        return total + (appointment.service?.price || 0);
      },
      0
    );

    return responseHandler(res,StatusCode.SUCCESS,"Admin statistics retrieved successfully.",
        {  todaysAppointments,  newBookings,  totalPatients,  revenueEstimate,}
    );
  } catch (error) {


    return responseHandler(res,StatusCode.SERVER_ERROR,"Unable to retrieve admin statistics." );
  }
};

module.exports = { getAdminStats };