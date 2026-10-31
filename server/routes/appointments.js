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
router.patch("/:id/cancel", bookingRateLimiter, (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }
  next();
}, cancelAppointment);
router.patch(
  "/:id/reschedule",
  bookingRateLimiter,
  (req, res, next) => {
    if (!req.headers.authorization) {
      return next();
    }

    return authMiddleware(req, res, next);
  },
  rescheduleAppointment
);
router.patch("/:id/status",authMiddleware,roleMiddleware("admin"),bookingRateLimiter,updateAppointmentStatus);

module.exports = router;