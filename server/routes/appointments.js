const express = require("express");
const router = express.Router();

const { bookAppointment, getAvailableSlots } = require("../controllers/appointments");

router.post("/book", bookAppointment);
router.get("/getAvailableSlots", getAvailableSlots);


module.exports = router;