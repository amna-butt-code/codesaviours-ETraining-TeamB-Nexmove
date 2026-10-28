const express = require('express');
const router = express.Router();

const {registerUser, userLogin,updateUser,deleteUser} = require('../controllers/auth');
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");



router.post('/signUp', registerUser);
router.post('/login', userLogin);
router.put("/users/:id", authMiddleware, roleMiddleware("admin"), updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

module.exports = router;