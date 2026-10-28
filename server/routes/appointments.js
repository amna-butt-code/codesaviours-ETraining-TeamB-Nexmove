
const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const validateGuestAppointmentBooking = require("../middleware/validateGuestAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");

const {
  bookAppointment,
  bookGuestAppointment,
  getAvailableSlots,
} = require("../controllers/appointments");

// Registered patient booking
router.post(
  "/book",
  authMiddleware,
  bookingRateLimiter,
  validateAppointmentBooking,
  bookAppointment
);

// Guest booking — no login required
router.post(
  "/guest",
  bookingRateLimiter,
  validateGuestAppointmentBooking,
  bookGuestAppointment
);

// Public available-slots endpoint
router.get("/getAvailableSlots", getAvailableSlots);

module.exports = router;
