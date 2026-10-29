const mongoose = require("mongoose");
const Faq = require("../models/Faq");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 100;

const badId = (res) => res.status(400).json({ success: false, message: "That FAQ link doesn't look right." });
const notFound = (res) => res.status(404).json({ success: false, message: "We couldn't find that FAQ." });

// GET /api/faqs/admin/all: includes unpublished FAQs
exports.listAllFaqs = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 50), MAX_LIMIT);

    const [faqs, total] = await Promise.all([
      Faq.find().sort({ category: 1, order: 1 }).skip((page - 1) * limit).limit(limit).select("-__v").lean(),
      Faq.countDocuments(),
    ]);

    res.json({ success: true, data: faqs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("listAllFaqs failed:", error);
    serverError(res);
  }
};

// POST /api/faqs
exports.createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    console.error("createFaq failed:", error);
    serverError(res);
  }
};

// PUT /api/faqs/:id
exports.updateFaq = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const faq = await Faq.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!faq) return notFound(res);

    res.json({ success: true, data: faq });
  } catch (error) {
    console.error("updateFaq failed:", error);
    serverError(res);
  }
};

// DELETE /api/faqs/:id
exports.deleteFaq = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return notFound(res);

    res.json({ success: true, message: "FAQ deleted." });
  } catch (error) {
    console.error("deleteFaq failed:", error);
    serverError(res);
  }
};