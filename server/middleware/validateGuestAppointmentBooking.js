const guestAppointmentBookingSchema = require("../validation/guestAppointmentBookingSchema");


const validateGuestAppointmentBooking = (req, res, next) => {
    const result = guestAppointmentBookingSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({
            status:400,
            message: "Invalid request data",
            errors: result.error.issues.map((issue)=>({
                field: issue.path.join("."),
                message: issue.message
            }))
        })
    }
    req.body = result.data;;
    next();
};


module.exports = validateGuestAppointmentBooking;