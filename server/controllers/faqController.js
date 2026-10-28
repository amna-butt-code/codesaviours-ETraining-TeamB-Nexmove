const mongoose = require("mongoose");
const Faq = require("../models/Faq");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 50;

// GET /api/faqs?page=1&limit=20&category=Booking
exports.getFaqs = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), MAX_LIMIT);

    const filter = { isPublished: true };
    // Only a plain string is accepted, so injected objects like ?category[$ne]=x are ignored
    if (typeof req.query.category === "string" && req.query.category.trim()) {
      filter.category = req.query.category.trim().slice(0, 60);
    }

    const [faqs, total] = await Promise.all([
      Faq.find(filter)
        .sort({ category: 1, order: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-__v")
        .lean(),
      Faq.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: faqs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getFaqs failed:", error);
    serverError(res);
  }
};

// GET /api/faqs/:id
exports.getFaqById = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ success: false, message: "That FAQ link doesn't look right." });
    }

    const faq = await Faq.findOne({ _id: req.params.id, isPublished: true })
      .select("-__v")
      .lean();

    if (!faq) {
      return res.status(404).json({ success: false, message: "We couldn't find that FAQ." });
    }

    res.json({ success: true, data: faq });
  } catch (error) {
    console.error("getFaqById failed:", error);
    serverError(res);
  }
};