
const express = require("express");
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
  updateService,
} = require("../controllers/serviceRoutes");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public read endpoints
router.get("/getServices", getServices);
router.get("/getService/:id", getServiceById);

// Admin-only write endpoints
router.post(
  "/newService",
  authMiddleware,
  roleMiddleware("admin"),
  createService
);

router.patch(
  "/updateService/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateService
);

module.exports = router;
