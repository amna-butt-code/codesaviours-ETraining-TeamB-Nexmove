const mongoose = require("mongoose");
const Message = require("../models/Message");
const { toPositiveInt, serverError } = require("../utils/http");

const MAX_LIMIT = 100;
const STATUSES = ["new", "read", "replied"];

const badId = (res) => res.status(400).json({ success: false, message: "That message link doesn't look right." });
const notFound = (res) => res.status(404).json({ success: false, message: "We couldn't find that message." });

// GET /api/messages?status=new&page=1: newest first
exports.listMessages = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), MAX_LIMIT);

    const filter = {};
    if (typeof req.query.status === "string" && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-__v").lean(),
      Message.countDocuments(filter),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("listMessages failed:", error);
    serverError(res);
  }
};

// PATCH /api/messages/:id: only the status can change
exports.updateMessageStatus = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    ).select("-__v");
    if (!message) return notFound(res);

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("updateMessageStatus failed:", error);
    serverError(res);
  }
};

// DELETE /api/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badId(res);

    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return notFound(res);

    res.json({ success: true, message: "Message deleted." });
  } catch (error) {
    console.error("deleteMessage failed:", error);
    serverError(res);
  }
};