
const Package = require("../models/Package");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 50;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Public packages only show when active
const visible = () => ({ isActive: true });

// GET /api/packages?page=1&limit=10
exports.getPackages = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 10), MAX_LIMIT);

    const filter = visible();

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name slug description price currency sessions")
        .lean(),
      Package.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: packages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getPackages failed:", error);
    serverError(res);
  }
};

// GET /api/packages/:slug
exports.getPackageBySlug = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    if (slug.length > 140 || !SLUG_PATTERN.test(slug)) {
      return res.status(400).json({
        success: false,
        message: "That package link doesn't look right.",
      });
    }

    const item = await Package.findOne({ slug, ...visible() })
      .select("-__v -isActive")
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "We couldn't find that package.",
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error("getPackageBySlug failed:", error);
    serverError(res);
  }
};
