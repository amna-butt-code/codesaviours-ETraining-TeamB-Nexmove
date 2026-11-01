const express = require("express");
const router = express.Router();

const {
  createTherapist,
  getTherapists,
  updateTherapist,
  deleteTherapist
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

router.put("/update/:id",authMiddleware,roleMiddleware("admin"),updateTherapist);
router.delete("/delete/:id",authMiddleware,roleMiddleware("admin"),deleteTherapist);

module.exports = router;
