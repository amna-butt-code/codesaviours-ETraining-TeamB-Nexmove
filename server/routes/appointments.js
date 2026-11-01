const express = require("express");
const router = express.Router();

const validateAppointmentBooking = require("../middleware/validateAppointmentBooking");
const validateGuestAppointmentBooking = require("../middleware/validateGuestAppointmentBooking");
const bookingRateLimiter = require("../middleware/bookingRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const appointmentController = require("../controllers/appointments");

// Optional authentication:
// - Guests can submit ownership details.
// - Signed-in patients and admins are authenticated normally.
const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }

  return authMiddleware(req, res, next);
};

/* -------------------------------------------------------------------------- */
/*                         Patient Appointment History                       */
/* -------------------------------------------------------------------------- */

// Main patient portal endpoint.
router.get(
  "/",
  authMiddleware,
  roleMiddleware("patient"),
  appointmentController.getMyAppointments
);

// Backwards-compatible endpoint for existing frontend calls.
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  appointmentController.getMyAppointments
);

/* -------------------------------------------------------------------------- */
/*                                  Booking                                   */
/* -------------------------------------------------------------------------- */

// Authenticated patient booking.
router.post(
  "/book",
  authMiddleware,
  roleMiddleware("patient"),
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

// Public available-slot lookup.
router.get(
  "/getAvailableSlots",
  bookingRateLimiter,
  appointmentController.getAvailableSlots
);

/* -------------------------------------------------------------------------- */
/*                         Cancellation and Rescheduling                      */
/* -------------------------------------------------------------------------- */

// Patients must authenticate. Guests must provide their booking email
// and phone, which are checked inside the controller.
router.patch(
  "/:id/cancel",
  bookingRateLimiter,
  optionalAuth,
  appointmentController.cancelAppointment
);

router.patch(
  "/:id/reschedule",
  bookingRateLimiter,
  optionalAuth,
  appointmentController.rescheduleAppointment
);

/* -------------------------------------------------------------------------- */
/*                              Admin Management                              */
/* -------------------------------------------------------------------------- */

// Admin-only appointment status update.
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  bookingRateLimiter,
  appointmentController.updateAppointmentStatus
);

// Admin-only appointment listing and filtering.
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  appointmentController.getAllAppointments
);

module.exports = router;