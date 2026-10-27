
const mongoose = require("mongoose");
const Package = require("../models/Package");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 100;

const badId = (res) =>
  res.status(400).json({
    success: false,
    message: "That package link doesn't look right.",
  });

const notFound = (res) =>
  res.status(404).json({
    success: false,
    message: "We couldn't find that package.",
  });

const duplicate = (res) =>
  res.status(409).json({
    success: false,
    message: "A package with that slug already exists.",
    errors: { slug: "This slug is already in use" },
  });

// GET /api/packages/admin/all
exports.listAllPackages = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 50), MAX_LIMIT);

    const [items, total] = await Promise.all([
      Package.find()
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-__v")
        .lean(),
      Package.countDocuments(),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("listAllPackages failed:", error);
    serverError(res);
  }
};

// POST /api/packages
exports.createPackage = async (req, res) => {
  try {
    const item = await Package.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) return duplicate(res);

    console.error("createPackage failed:", error);
    serverError(res);
  }
};

// PUT /api/packages/:id
exports.updatePackage = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return badId(res);
    }

    const item = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!item) return notFound(res);

    res.json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) return duplicate(res);

    console.error("updatePackage failed:", error);
    serverError(res);
  }
};

// DELETE /api/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return badId(res);
    }

    const item = await Package.findByIdAndDelete(req.params.id);
    if (!item) return notFound(res);

    res.json({ success: true, message: "Package deleted." });
  } catch (error) {
    console.error("deletePackage failed:", error);
    serverError(res);
  }
};
