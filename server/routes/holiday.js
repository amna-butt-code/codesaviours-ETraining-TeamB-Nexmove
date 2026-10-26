const express = require("express");
const router = express.Router();

const { createHoliday, getHolidays } = require("../controllers/holiday");

router.post("/newholiday", createHoliday);
router.get("/getholidays", getHolidays);

module.exports = router;