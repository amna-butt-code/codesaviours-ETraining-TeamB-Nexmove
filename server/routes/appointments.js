const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const validateGuestAppointmentBooking = require("../middleware/validateGuestAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require ("../middleware/roleMiddleware")


const {bookAppointment,getAvailableSlots,bookGuestAppointment,cancelAppointment,rescheduleAppointment,updateAppointmentStatus} = require("../controllers/appointments");


router.post("/book",authMiddleware,validateAppointmentBooking,bookingRateLimiter,bookAppointment);
router.post("/bookGuest",validateGuestAppointmentBooking,bookingRateLimiter,bookGuestAppointment);
router.get("/getAvailableSlots",bookingRateLimiter,getAvailableSlots);
router.patch("/:id/cancel", authMiddleware, bookingRateLimiter, cancelAppointment);
router.patch("/:id/reschedule", authMiddleware,bookingRateLimiter,rescheduleAppointment);
router.patch("/:id/status",authMiddleware,roleMiddleware("admin"),bookingRateLimiter,updateAppointmentStatus);

module.exports = router;