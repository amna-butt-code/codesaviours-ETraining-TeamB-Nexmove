const express = require("express");
const router = express.Router();

const {
  createHoliday,
  getHolidays,
} = require("../controllers/holiday");

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

// Admin-only writes
router.post(
  "/newholiday",
  authMiddleware,
  roleMiddleware("admin"),
  createHoliday
);

// Public read endpoint
router.get("/getholidays", getHolidays);

module.exports = router;
