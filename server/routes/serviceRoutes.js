const express = require("express");
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
} = require("../controllers/serviceRoutes");

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

// Public read endpoints
router.get("/getServices", getServices);
router.get("/getService/:id", getServiceById);

// Admin-only write endpoint
router.post(
  "/newService",
  authMiddleware,
  roleMiddleware("admin"),
  createService
);

module.exports = router;
