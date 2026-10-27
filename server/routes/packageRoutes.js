const express = require("express");

const { getPackages, getPackageBySlug } = require("../controllers/packageController");
const {
  listAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/packageAdminController");

const { readLimiter, writeLimiter } = require("../middleware/rateLimiters");
const requireAdmin = require("../middleware/requireAdmin");
const { validateBody } = require("../middleware/validate");
const {
  createPackageSchema,
  updatePackageSchema,
} = require("../validators/packageSchemas");

const router = express.Router();

router.get("/", readLimiter, getPackages);

// Must come before "/:slug".
router.get("/admin/all", writeLimiter, requireAdmin, listAllPackages);
router.get("/:slug", readLimiter, getPackageBySlug);

router.post(
  "/",
  writeLimiter,
  requireAdmin,
  validateBody(createPackageSchema),
  createPackage
);

router.put(
  "/:id",
  writeLimiter,
  requireAdmin,
  validateBody(updatePackageSchema),
  updatePackage
);

router.delete("/:id", writeLimiter, requireAdmin, deletePackage);

module.exports = router;
