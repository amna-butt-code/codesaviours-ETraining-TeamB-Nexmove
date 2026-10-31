const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  chat,
  isUrgentMessage,
} = require("../controllers/assistantController");

const router = express.Router();

const assistantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You've reached the assistant's message limit. Please try again later.",
  },
});

// Emergency messages must reach the controller's urgent-response handler.
// Normal requests still go through the rate limiter.
function limitNonUrgentRequests(req, res, next) {
  if (isUrgentMessage(req.body?.message)) {
    return next();
  }

  return assistantLimiter(req, res, next);
}

router.post("/chat", limitNonUrgentRequests, chat);

module.exports = router;