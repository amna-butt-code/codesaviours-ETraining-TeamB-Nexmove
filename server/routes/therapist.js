const express = require("express");
const router = express.Router();

const {
  createTherapist,
  getTherapists,
  updateTherapist,
  deleteTherapist,
} = require("../controllers/therapist");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/* -------------------------------------------------------------------------- */
/*                                Public Read                                 */
/* -------------------------------------------------------------------------- */

router.get("/allTherapists", getTherapists);

/* -------------------------------------------------------------------------- */
/*                              Admin Management                              */
/* -------------------------------------------------------------------------- */

router.post(
  "/newTherapist",
  authMiddleware,
  roleMiddleware("admin"),
  createTherapist
);

// Existing feature-branch endpoint.
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateTherapist
);

// Incoming main-branch endpoint.
router.patch(
  "/updateTherapist/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateTherapist
);

// Existing delete endpoint.
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteTherapist
);

module.exports = router;