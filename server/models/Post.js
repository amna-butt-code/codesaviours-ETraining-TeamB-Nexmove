const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: [5, "Post title is too short"],
      maxlength: [150, "Post title must be 150 characters or fewer"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [170, "Slug must be 170 characters or fewer"],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and single hyphens"],
    },
    excerpt: { type: String, trim: true, maxlength: [300, "Excerpt must be 300 characters or fewer"] },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [50000, "Post content is too long"],
    },
    category: { type: String, trim: true, maxlength: 60, default: "General" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Public blog listing: published posts, newest first
postSchema.index({ isPublished: 1, publishedAt: -1 });
postSchema.index({ category: 1 });

module.exports = mongoose.model("Post", postSchema);