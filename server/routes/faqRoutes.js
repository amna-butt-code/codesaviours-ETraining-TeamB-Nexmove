const express = require("express");
const { getFaqs, getFaqById } = require("../controllers/faqController");
const { listAllFaqs, createFaq, updateFaq, deleteFaq } = require("../controllers/faqAdminController");
const { readLimiter, writeLimiter } = require("../middleware/rateLimiters");
const requireAdmin = require("../middleware/requireAdmin");
const { validateBody } = require("../middleware/validate");
const { createFaqSchema, updateFaqSchema } = require("../validators/faqSchemas");

const router = express.Router();

// Public
router.get("/", readLimiter, getFaqs);

// Admin. This must stay above "/:id" so "admin" is never read as an id
router.get("/admin/all", writeLimiter, requireAdmin, listAllFaqs);

router.get("/:id", readLimiter, getFaqById);

// Admin writes: rate limit first (also covers floods of bad logins), then the
// admin check, then input validation, then the controller
router.post("/", writeLimiter, requireAdmin, validateBody(createFaqSchema), createFaq);
router.put("/:id", writeLimiter, requireAdmin, validateBody(updateFaqSchema), updateFaq);
router.delete("/:id", writeLimiter, requireAdmin, deleteFaq);

module.exports = router;