const rateLimit = require("express-rate-limit");

// Public read endpoints: max 300 requests per IP every 15 minutes
exports.readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait a moment and try again." },
});

// Contact form: max 5 messages per IP per hour
exports.contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "You've sent a few messages recently. Please try again later, or call us directly.",
  },
});


// Admin routes: max 100 requests per IP every 15 minutes
exports.writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait a moment and try again." },
});


// Password reset: max 5 requests per IP every 15 minutes
exports.passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later."
  }
});