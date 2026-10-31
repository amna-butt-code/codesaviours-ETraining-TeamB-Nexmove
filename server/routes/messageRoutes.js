const express = require("express");
const { createMessage } = require("../controllers/messageController");
const { listMessages, updateMessageStatus, deleteMessage } = require("../controllers/messageAdminController");
const { contactLimiter, writeLimiter } = require("../middleware/rateLimiters");
const requireAdmin = require("../middleware/requireAdmin");
const { validateBody } = require("../middleware/validate");
const { updateMessageStatusSchema } = require("../validators/messageSchemas");

const router = express.Router();

// Public: the contact form
router.post("/", contactLimiter, createMessage);

// Admin: the inbox. Patient messages are personal data, so never public.
router.get("/", writeLimiter, requireAdmin, listMessages);
router.patch("/:id", writeLimiter, requireAdmin, validateBody(updateMessageStatusSchema), updateMessageStatus);
router.delete("/:id", writeLimiter, requireAdmin, deleteMessage);

module.exports = router;