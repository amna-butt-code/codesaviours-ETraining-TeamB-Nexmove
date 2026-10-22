const express = require("express");
const { createMessage } = require("../controllers/messageController");
const { contactLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", contactLimiter, createMessage);

module.exports = router;