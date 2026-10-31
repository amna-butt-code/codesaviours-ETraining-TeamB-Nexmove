const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const validateGuestAppointmentBooking = require("../middleware/validateGuestAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const appointmentController = require("../controllers/appointments");

const {
  getMyAppointments,
} = require("../controllers/patientAppointments");

// Patient appointment history.
// The patient is identified through the verified JWT.
router.get(
  "/",
  authMiddleware,
  roleMiddleware("patient"),
  getMyAppointments
);

// Authenticated patient booking.
router.post(
  "/book",
  authMiddleware,
  validateAppointmentBooking,
  bookingRateLimiter,
  appointmentController.bookAppointment
);

// Guest booking.
router.post(
  "/bookGuest",
  validateGuestAppointmentBooking,
  bookingRateLimiter,
  appointmentController.bookGuestAppointment
);

// Available appointment slots.
router.get(
  "/getAvailableSlots",
  bookingRateLimiter,
  appointmentController.getAvailableSlots
);

// Cancellation, rescheduling and status handlers are registered
// only when they are exported by the appointment controller.
if (typeof appointmentController.cancelAppointment === "function") {
  router.patch(
    "/:id/cancel",
    authMiddleware,
    bookingRateLimiter,
    appointmentController.cancelAppointment
  );
}

if (typeof appointmentController.rescheduleAppointment === "function") {
  router.patch(
    "/:id/reschedule",
    authMiddleware,
    bookingRateLimiter,
    appointmentController.rescheduleAppointment
  );
}

if (typeof appointmentController.updateAppointmentStatus === "function") {
  router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    bookingRateLimiter,
    appointmentController.updateAppointmentStatus
  );
}

// router.post("/bookGuest",validateGuestAppointmentBooking,bookingRateLimiter,bookGuestAppointment);
// router.get("/getAvailableSlots",bookingRateLimiter,getAvailableSlots);
// router.patch("/:id/cancel", bookingRateLimiter, (req, res, next) => {
//   if (req.headers.authorization) {
//     return authMiddleware(req, res, next);
//   }
//   next();
// }, cancelAppointment);
// router.patch(
//   "/:id/reschedule",
//   bookingRateLimiter,
//   (req, res, next) => {
//     if (!req.headers.authorization) {
//       return next();
//     }

//     return authMiddleware(req, res, next);
//   },
//   rescheduleAppointment
// );
// router.patch("/:id/status",authMiddleware,roleMiddleware("admin"),bookingRateLimiter,updateAppointmentStatus);

module.exports = router;