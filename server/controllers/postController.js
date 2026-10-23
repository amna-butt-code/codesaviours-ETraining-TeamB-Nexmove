const Post = require("../models/Post");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 50;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// A post is public only when it is published AND its publish date has arrived
const visible = () => ({ isPublished: true, publishedAt: { $lte: new Date() } });

// GET /api/posts?page=1&limit=10&category=Wellness
// Cards only: no full content, so the list stays small and fast
exports.getPosts = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 10), MAX_LIMIT);

    const filter = visible();
    if (typeof req.query.category === "string" && req.query.category.trim()) {
      filter.category = req.query.category.trim().slice(0, 60);
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title slug excerpt category publishedAt")
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getPosts failed:", error);
    serverError(res);
  }
};

// GET /api/posts/:slug
exports.getPostBySlug = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    if (slug.length > 170 || !SLUG_PATTERN.test(slug)) {
      return res.status(400).json({ success: false, message: "That page link doesn't look right." });
    }

    const post = await Post.findOne({ slug, ...visible() })
      .select("-__v -isPublished -author")
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: "We couldn't find that article." });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error("getPostBySlug failed:", error);
    serverError(res);
  }
};