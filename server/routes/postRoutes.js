const express = require("express");
const { getPosts, getPostBySlug } = require("../controllers/postController");
const { readLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/", readLimiter, getPosts);
router.get("/:slug", readLimiter, getPostBySlug);

module.exports = router;