const Condition = require("../models/Condition");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 50;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// GET /api/conditions?page=1&limit=20
// The list sends only what a card needs, not the full description
exports.getConditions = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), MAX_LIMIT);
    const filter = { isPublished: true };

    const [conditions, total] = await Promise.all([
      Condition.find(filter)
        .sort({ title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title slug summary")
        .lean(),
      Condition.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: conditions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getConditions failed:", error);
    serverError(res);
  }
};

// GET /api/conditions/:slug
exports.getConditionBySlug = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    // Reject anything that isn't a valid slug before touching the database
    if (slug.length > 140 || !SLUG_PATTERN.test(slug)) {
      return res.status(400).json({ success: false, message: "That page link doesn't look right." });
    }

    const condition = await Condition.findOne({ slug, isPublished: true })
      .select("-__v -isPublished")
      .lean();

    if (!condition) {
      return res.status(404).json({ success: false, message: "We couldn't find that condition." });
    }

    res.json({ success: true, data: condition });
  } catch (error) {
    console.error("getConditionBySlug failed:", error);
    serverError(res);
  }
};