const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Condition title is required"],
      trim: true,
      minlength: [2, "Condition title is too short"],
      maxlength: [120, "Condition title must be 120 characters or fewer"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [140, "Slug must be 140 characters or fewer"],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only use lowercase letters, numbers and single hyphens",
      ],
    },
    summary: {
      type: String,
      required: [true, "A short summary is required"],
      trim: true,
      maxlength: [300, "Summary must be 300 characters or fewer"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [10000, "Description is too long"],
    },
    commonSymptoms: {
      type: [{ type: String, trim: true, maxlength: 150 }],
      validate: [(list) => list.length <= 20, "Please list 20 symptoms or fewer"],
    },
    whenToSeekHelp: { type: String, trim: true, maxlength: 1000 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast listing of published conditions in alphabetical order
conditionSchema.index({ isPublished: 1, title: 1 });

module.exports = mongoose.model("Condition", conditionSchema);