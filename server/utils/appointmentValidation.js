
const { z } = require("zod");

const appointmentBookingSchema = z.object({
  therapistId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid therapist ID"),
  serviceId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid service ID"),
  appointmentDate: z.string().datetime({
    offset: true,
    message: "Appointment date must be a valid ISO date-time with timezone"
  }),
  consentGiven: z.boolean().refine((value) => value === true, {
    message: "Consent is required to book an appointment"
  }),
  guestName: z.string().trim().min(1).max(100).optional(),
  guestPhone: z.string().trim().min(7).max(20).optional(),
  notes: z.string().max(500, "Notes must be 500 characters or fewer").optional()
})

module.exports = { appointmentBookingSchema };
