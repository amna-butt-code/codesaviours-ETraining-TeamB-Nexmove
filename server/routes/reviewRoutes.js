const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  listApprovedReviews,
  createReview,
  approveReview,
} = require("../controllers/reviewController");

const router = express.Router();

// Only clinic-approved reviews are publicly visible.
router.get("/", listApprovedReviews);
// Patients can review only their own completed appointments.
router.post("/", authMiddleware, createReview);
// Only admins can publish a review.
router.put("/:id/approve", authMiddleware, roleMiddleware("admin"), approveReview);

module.exports = router;
