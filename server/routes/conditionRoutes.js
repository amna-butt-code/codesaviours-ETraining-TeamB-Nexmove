const express = require("express");
const { getConditions, getConditionBySlug } = require("../controllers/conditionController");
const {
  listAllConditions,
  createCondition,
  updateCondition,
  deleteCondition,
} = require("../controllers/conditionAdminController");
const { readLimiter, writeLimiter } = require("../middleware/rateLimiters");
const requireAdmin = require("../middleware/requireAdmin");
const { validateBody } = require("../middleware/validate");
const { createConditionSchema, updateConditionSchema } = require("../validators/conditionSchemas");

const router = express.Router();

// Public
router.get("/", readLimiter, getConditions);

// Admin. Keep this above "/:slug"
router.get("/admin/all", writeLimiter, requireAdmin, listAllConditions);

router.get("/:slug", readLimiter, getConditionBySlug);

// Admin writes
router.post("/", writeLimiter, requireAdmin, validateBody(createConditionSchema), createCondition);
router.put("/:id", writeLimiter, requireAdmin, validateBody(updateConditionSchema), updateCondition);
router.delete("/:id", writeLimiter, requireAdmin, deleteCondition);

module.exports = router;