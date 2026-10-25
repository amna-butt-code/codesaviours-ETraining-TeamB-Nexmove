const mongoose = require("mongoose");
const Condition = require("../models/Condition");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 100;

const badId = (res) => res.status(400).json({ success: false, message: "That condition link doesn't look right." });
const notFound = (res) => res.status(404).json({ success: false, message: "We couldn't find that condition." });
const duplicate = (res) =>
  res.status(409).json({
    success: false,
    message: "A condition with that slug already exists.",
    errors: { slug: "This slug is already in use" },
  });

// GET /api/conditions/admin/all: includes unpublished conditions
exports.listAllConditions = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 50), MAX_LIMIT);

    const [items, total] = await Promise.all([
      Condition.find().sort({ title: 1 }).skip((page - 1) * limit).limit(limit).select("-__v").lean(),
      Condition.countDocuments(),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("listAllConditions failed:", error);
    serverError(res);
  }
};

// POST /api/conditions
exports.createCondition = async (req, res) => {
  try {
    const condition = await Condition.create(req.body);
    res.status(201).json({ success: true, data: condition });
  } catch (error) {
    if (error.code === 11000) return duplicate(res);
    console.error("createCondition failed:", error);
    serverError(res);
  }
};

// PUT /api/conditions/:id
exports.updateCondition = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const condition = await Condition.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!condition) return notFound(res);

    res.json({ success: true, data: condition });
  } catch (error) {
    if (error.code === 11000) return duplicate(res);
    console.error("updateCondition failed:", error);
    serverError(res);
  }
};

// DELETE /api/conditions/:id
exports.deleteCondition = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const condition = await Condition.findByIdAndDelete(req.params.id);
    if (!condition) return notFound(res);

    res.json({ success: true, message: "Condition deleted." });
  } catch (error) {
    console.error("deleteCondition failed:", error);
    serverError(res);
  }
};