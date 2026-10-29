const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exercise title is required"],
      trim: true,
      minlength: [3, "Exercise title is too short"],
      maxlength: [120, "Exercise title must be 120 characters or fewer"],
    },
    instructions: {
      type: [{ type: String, trim: true, maxlength: 500 }],
      validate: [
        { validator: (steps) => steps.length >= 1, message: "Add at least one instruction step" },
        { validator: (steps) => steps.length <= 30, message: "Please use 30 steps or fewer" },
      ],
    },
    mediaType: { type: String, enum: ["image", "video"] },
    // Only https links are accepted, which also blocks javascript: URLs
    mediaUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      match: [/^https:\/\/[^\s]+$/i, "Media link must be a valid https URL"],
    },
    // Shown with every exercise: general guidance, not medical advice
    safetyNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Stop if you feel pain and speak to your physiotherapist before continuing.",
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

exerciseSchema.index({ isPublished: 1, title: 1 });

module.exports = mongoose.model("Exercise", exerciseSchema);