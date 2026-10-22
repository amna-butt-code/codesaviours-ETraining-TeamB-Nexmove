const rateLimit = require("express-rate-limit");

// Public read endpoints: max 300 requests per IP every 15 minutes
exports.readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait a moment and try again." },
});