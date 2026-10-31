const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const deny = (res, status, message) => res.status(status).json({ success: false, message });

// Signed-in admins only. The role is read from the database on every request,
// so a demoted or deleted admin loses access immediately.
module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return deny(res, 401, "Please sign in as an admin to do that.");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return deny(res, 500, "Something went wrong. Please try again.");
    }

    let payload;
    try {
      payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return deny(res, 401, "Your session has expired. Please sign in again.");
    }

    if (!mongoose.isObjectIdOrHexString(payload.id)) {
      return deny(res, 401, "Your session has expired. Please sign in again.");
    }

    const user = await User.findById(payload.id).select("role").lean();
    if (!user || user.role !== "admin") {
      return deny(res, 403, "You don't have permission to do that.");
    }

    req.user = { id: payload.id, role: user.role };
    next();
  } catch (error) {
    console.error("requireAdmin failed:", error);
    return deny(res, 500, "Something went wrong. Please try again.");
  }
};