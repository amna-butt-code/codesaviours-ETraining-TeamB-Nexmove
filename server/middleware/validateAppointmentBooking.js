const { appointmentBookingSchema } = require("../utils/appointmentValidation");

const validateAppointmentBooking = (req, res, next) => {
  const result = appointmentBookingSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: 400,
      message: "Invalid appointment booking data.",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  req.body = result.data;
  next();
};

module.exports = validateAppointmentBooking;
