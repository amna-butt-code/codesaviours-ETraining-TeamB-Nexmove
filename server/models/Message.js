const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
      trim: true,
      minlength: [2, "Your name looks too short"],
      maxlength: [100, "Name must be 100 characters or fewer"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email so we can reply"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email address is too long"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "That email address doesn't look right"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9\s\-()]{7,20}$/, "That phone number doesn't look right"],
    },
    subject: { type: String, trim: true, maxlength: [150, "Subject is too long"] },
    message: {
      type: String,
      required: [true, "Please write a message"],
      trim: true,
      minlength: [10, "Please add a little more detail"],
      maxlength: [2000, "Message must be 2000 characters or fewer"],
    },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
  },
  { timestamps: true }
);

// Fast inbox view for admins: filter by status, newest first
messageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);