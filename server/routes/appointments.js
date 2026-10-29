const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const validateGuestAppointmentBooking = require("../middleware/validateGuestAppointmentBooking");
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

<<<<<<< HEAD
router.post("/book", authMiddleware, validateAppointmentBooking, bookingRateLimiter, bookAppointment);
router.post("/bookGuest", validateGuestAppointmentBooking, bookingRateLimiter, bookGuestAppointment);
router.get("/getAvailableSlots", authMiddleware, getAvailableSlots);
=======
// Public endpoint required by the booking UI
router.get("/getAvailableSlots", getAvailableSlots);
>>>>>>> c6b195dfaec4aed43a022109bb96f93b0d4de1fd

module.exports = router;
