const express = require("express");
const router = express.Router();

const {
  createTherapist,
  getTherapists,
} = require("../controllers/therapist");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public read endpoint
router.get("/allTherapists", getTherapists);

// Admin-only write endpoint
router.post(
  "/newTherapist",
  authMiddleware,
  roleMiddleware("admin"),
  createTherapist
);

module.exports = router;
