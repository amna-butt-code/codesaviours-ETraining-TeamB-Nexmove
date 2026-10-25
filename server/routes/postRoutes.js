const express = require("express");
const { getPosts, getPostBySlug } = require("../controllers/postController");
const { listAllPosts, createPost, updatePost, deletePost } = require("../controllers/postAdminController");
const { readLimiter, writeLimiter } = require("../middleware/rateLimiters");
const requireAdmin = require("../middleware/requireAdmin");
const { validateBody } = require("../middleware/validate");
const { createPostSchema, updatePostSchema } = require("../validators/postSchemas");

const router = express.Router();

// Public
router.get("/", readLimiter, getPosts);

// Admin. Keep this above "/:slug"
router.get("/admin/all", writeLimiter, requireAdmin, listAllPosts);

router.get("/:slug", readLimiter, getPostBySlug);

// Admin writes
router.post("/", writeLimiter, requireAdmin, validateBody(createPostSchema), createPost);
router.put("/:id", writeLimiter, requireAdmin, validateBody(updatePostSchema), updatePost);
router.delete("/:id", writeLimiter, requireAdmin, deletePost);

module.exports = router;