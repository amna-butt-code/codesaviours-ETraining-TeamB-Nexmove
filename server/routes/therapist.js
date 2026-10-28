
const express = require("express");
const router = express.Router();



const authMiddleware  = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { createTherapist, getTherapists} = require("../controllers/therapist");

router.post("/newTherapist", authMiddleware, roleMiddleware(["admin"]), createTherapist);
router.get("/allTherapists", authMiddleware, roleMiddleware(["admin"]), getTherapists);

module.exports = router;
