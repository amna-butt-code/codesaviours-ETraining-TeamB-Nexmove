const express = require("express");
const rateLimit = require("express-rate-limit");
const { getFaqs, getFaqById } = require("../controllers/faqController");

const router = express.Router();

// Max 300 requests per IP every 15 minutes on public reads
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait a moment and try again." },
});

router.get("/", readLimiter, getFaqs);
router.get("/:id", readLimiter, getFaqById);

module.exports = router;