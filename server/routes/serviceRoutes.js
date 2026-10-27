const express = require("express");
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
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

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateService
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteService
);

module.exports = router;
