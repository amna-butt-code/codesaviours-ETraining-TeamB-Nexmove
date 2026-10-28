const express = require("express");
const router = express.Router();


const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { createHoliday, getHolidays } = require("../controllers/holiday");

router.post("/newholiday", authMiddleware, roleMiddleware(["admin"]), createHoliday);
router.get("/getholidays", authMiddleware, roleMiddleware(["admin"]), getHolidays);

module.exports = router;