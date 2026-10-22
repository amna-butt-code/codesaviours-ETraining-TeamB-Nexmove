const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Refs point at Hammad's Patient and Appointment models (not merged yet)
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: [true, "Patient is required"] },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment is required"],
      unique: true, // one review per appointment
    },
    rating: {
      type: Number,
      required: [true, "Please choose a rating from 1 to 5"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating can't be more than 5"],
      validate: { validator: Number.isInteger, message: "Rating must be a whole number" },
    },
    text: {
      type: String,
      required: [true, "Please write a short review"],
      trim: true,
      minlength: [10, "Please add a little more detail"],
      maxlength: [1000, "Review must be 1000 characters or fewer"],
    },
    // Filled in later by the sentiment analysis feature, never by the user
    sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
    // Reviews stay hidden until an admin approves them
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Public list of approved reviews, newest first
reviewSchema.index({ approved: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);