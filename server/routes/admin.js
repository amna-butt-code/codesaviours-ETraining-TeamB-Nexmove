const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getAdminStats } = require("../controllers/admin");


router.get("/stats", authMiddleware, roleMiddleware("admin"), getAdminStats);

module.exports = router;
