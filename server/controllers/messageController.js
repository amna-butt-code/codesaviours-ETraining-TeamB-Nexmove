const Message = require("../models/Message");
const { serverError } = require("../utils/http");

// Only these fields are ever read from the request
const ALLOWED_FIELDS = ["name", "email", "phone", "subject", "text"];

// Removes invisible control characters (keeps normal line breaks) and trims
const clean = (value) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const THANKS = "Thanks for reaching out! We'll get back to you soon.";

// POST /api/messages (public)
exports.createMessage = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    // Honeypot: real visitors never see this field, bots usually fill it.
    // We answer "success" so the bot learns nothing, and save nothing.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return res.status(201).json({ success: true, message: THANKS });
    }

    const data = {};
    for (const field of ALLOWED_FIELDS) {
      const value = body[field];
      if (value === undefined || value === null || value === "") continue;

      // Rejects objects and arrays such as { "$gt": "" }
      if (typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: "Please check the form and try again.",
          errors: { [field]: "This field must be text." },
        });
      }
      data[field] = clean(value);
    }

    // Mongoose validates every rule from the model before saving
    await Message.create(data);

    res.status(201).json({ success: true, message: THANKS });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (const [field, err] of Object.entries(error.errors)) {
        errors[field] = err.message;
      }
      return res.status(400).json({
        success: false,
        message: "Please check the highlighted fields.",
        errors,
      });
    }
    console.error("createMessage failed:", error);
    serverError(res);
  }
};