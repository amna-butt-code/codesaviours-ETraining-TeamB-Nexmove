const mongoose = require("mongoose");

const appointmentLockSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true
    },
    dateKey: {
      type: String,
      required: true
    },
    lockToken: {
  type: String,
  required: true
},
    lockedUntil: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

appointmentLockSchema.index(
  { therapist: 1, dateKey: 1 },
  { unique: true }
);

appointmentLockSchema.index(
  { lockedUntil: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("AppointmentLock", appointmentLockSchema);