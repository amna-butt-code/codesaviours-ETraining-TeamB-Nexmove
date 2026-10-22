const express = require("express");
const { getConditions, getConditionBySlug } = require("../controllers/conditionController");
const { readLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/", readLimiter, getConditions);
router.get("/:slug", readLimiter, getConditionBySlug);

module.exports = router;