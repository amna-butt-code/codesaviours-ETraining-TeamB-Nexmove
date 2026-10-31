const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
      minlength: [3, "Package name must be at least 3 characters"],
      maxlength: [120, "Package name must be 120 characters or fewer"],
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
    description: {
      type: String,
      required: [true, "Package description is required"],
      trim: true,
      maxlength: [1000, "Description must be 1000 characters or fewer"],
    },
    price: {
      type: Number,
      required: [true, "Package price is required"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      enum: ["PKR"],
      default: "PKR",
    },
    sessions: {
      type: Number,
      required: [true, "Session count is required"],
      min: [1, "A package must include at least one session"],
      validate: {
        validator: Number.isInteger,
        message: "Session count must be a whole number",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

packageSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model("Package", packageSchema);
