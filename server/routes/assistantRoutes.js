
const express = require("express");
const rateLimit = require("express-rate-limit");
const { chat } = require("../controllers/assistantController");

const router = express.Router();

const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many assistant requests. Please try again later.",
  },
});

router.post("/chat", assistantLimiter, chat);

module.exports = router;
