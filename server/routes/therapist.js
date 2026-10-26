
const express = require("express");
const router = express.Router();

const {
    createTherapist,
    getTherapists
} = require("../controllers/therapist");

router.post("/newTherapist", createTherapist);
router.get("/allTherapists", getTherapists);

module.exports = router;
