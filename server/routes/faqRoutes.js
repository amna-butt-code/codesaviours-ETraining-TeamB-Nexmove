const express = require("express");
const { getFaqs, getFaqById } = require("../controllers/faqController");
const { readLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/", readLimiter, getFaqs);
router.get("/:id", readLimiter, getFaqById);

module.exports = router;