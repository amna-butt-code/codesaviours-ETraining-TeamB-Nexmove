
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
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
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled"
      ],
      default: "pending"
    },
     notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
