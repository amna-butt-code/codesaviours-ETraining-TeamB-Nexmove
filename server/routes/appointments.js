const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const validateGuestAppointmentBooking = require("../middleware/validateGuestAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");


const {bookAppointment,getAvailableSlots,bookGuestAppointment} = require("../controllers/appointments");


router.post("/book",authMiddleware,validateAppointmentBooking,bookingRateLimiter,bookAppointment);
router.post("/bookGuest",validateGuestAppointmentBooking,bookingRateLimiter,bookGuestAppointment);
router.get("/getAvailableSlots",bookingRateLimiter,getAvailableSlots);

module.exports = router;