const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      minlength: [5, "Question is too short"],
      maxlength: [300, "Question must be 300 characters or fewer"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      maxlength: [3000, "Answer must be 3000 characters or fewer"],
    },
    category: { type: String, trim: true, maxlength: 60, default: "General" },
    order: { type: Number, default: 0, min: 0, max: 10000 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Fast public FAQ listing grouped by category and ordered
faqSchema.index({ isPublished: 1, category: 1, order: 1 });

module.exports = mongoose.model("Faq", faqSchema);