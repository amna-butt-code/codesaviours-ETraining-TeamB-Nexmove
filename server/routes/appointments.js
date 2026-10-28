const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");

const {
  bookAppointment,
  getAvailableSlots,
} = require("../controllers/appointments");

// Logged-in patient booking
router.post(
  "/book",
  authMiddleware,
  bookingRateLimiter,
  validateAppointmentBooking,
  bookAppointment
);

// Public endpoint required by the booking UI
router.get("/getAvailableSlots", getAvailableSlots);

module.exports = router;
