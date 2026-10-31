const mongoose = require("mongoose");
const Post = require("../models/Post");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 100;

const badId = (res) => res.status(400).json({ success: false, message: "That article link doesn't look right." });
const notFound = (res) => res.status(404).json({ success: false, message: "We couldn't find that article." });
const duplicate = (res) =>
  res.status(409).json({
    success: false,
    message: "An article with that slug already exists.",
    errors: { slug: "This slug is already in use" },
  });

// GET /api/posts/admin/all: includes drafts, without the full content
exports.listAllPosts = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 50), MAX_LIMIT);

    const [items, total] = await Promise.all([
      Post.find()
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title slug category isPublished publishedAt updatedAt")
        .lean(),
      Post.countDocuments(),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("listAllPosts failed:", error);
    serverError(res);
  }
};

// POST /api/posts: the author is the signed-in admin, never taken from the body
exports.createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.user.id,
      publishedAt: req.body.isPublished ? new Date() : undefined,
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    if (error.code === 11000) return duplicate(res);
    console.error("createPost failed:", error);
    serverError(res);
  }
};

// PUT /api/posts/:id: sets publishedAt the first time a post is published
exports.updatePost = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const update = { ...req.body };
    if (update.isPublished === true) {
      const existing = await Post.findById(req.params.id).select("publishedAt").lean();
      if (!existing) return notFound(res);
      if (!existing.publishedAt) update.publishedAt = new Date();
    }

    const post = await Post.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!post) return notFound(res);

    res.json({ success: true, data: post });
  } catch (error) {
    if (error.code === 11000) return duplicate(res);
    console.error("updatePost failed:", error);
    serverError(res);
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return notFound(res);

    res.json({ success: true, message: "Article deleted." });
  } catch (error) {
    console.error("deletePost failed:", error);
    serverError(res);
  }
};