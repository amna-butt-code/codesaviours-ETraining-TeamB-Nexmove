
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
   patient: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Patient",
        required: false
      },
    guestName: {
       type: String,
       trim: true
      },
    guestPhone: {
       type: String,
       trim: true
      },
    consentGiven: {
       type: Boolean,
       required: true,
       validate: {
       validator: (value) => value === true,
       message: "Consent must be given to book an appointment."
               }
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
     appointmentEnd: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.appointmentDate;
        },
        message: "Appointment end time must be after start time."
      }
    },
    status: {
      type: String,
      enum: [ "pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending"
    },
     notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Notes must be 500 characters or fewer"]
    }
  },
  { timestamps: true }
);

appointmentSchema.index(
  { therapist: 1, appointmentDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] }
    }
  }
);
module.exports = mongoose.model("Appointment", appointmentSchema);
