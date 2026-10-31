const express = require('express');
const router = express.Router();

const {registerUser, userLogin,updateUser,deleteUser, forgotPassword, resetPassword} = require('../controllers/auth');
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {passwordResetLimiter} = require("../middleware/rateLimiters")



router.post('/signUp', registerUser);
router.post('/login', userLogin);
router.put("/users/:id", authMiddleware, roleMiddleware("admin"), updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);
router.post('/forgot-password',passwordResetLimiter, forgotPassword);
router.post('/reset-password',passwordResetLimiter, resetPassword);


module.exports = router;