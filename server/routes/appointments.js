const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");
const { bookAppointment, getAvailableSlots,bookGuestAppointment } = require("../controllers/appointments");



router.post("/book", authMiddleware, validateAppointmentBooking, bookingRateLimiter, bookAppointment);
router.post("/bookGuest", validateAppointmentBooking, bookingRateLimiter, bookGuestAppointment);
router.get("/getAvailableSlots", authMiddleware, getAvailableSlots);



module.exports = router;