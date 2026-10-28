
const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    scope: { 
      type: String,
      enum: ["clinic", "therapist"],
      default: "clinic"
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
