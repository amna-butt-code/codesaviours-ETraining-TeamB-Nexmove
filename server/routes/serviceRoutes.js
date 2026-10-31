
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

// Admin-only create endpoint
router.post(
    "/newService",
    authMiddleware,
    roleMiddleware("admin"),
    createService
);

// Admin-only update endpoints
// REST-style endpoints
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateService
);

router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateService
);

// Backward-compatible endpoint used by the main branch
router.patch(
    "/updateService/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateService
);

// Admin-only soft-delete endpoint
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteService
);

module.exports = router;
