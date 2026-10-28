const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {createService,getServices,getServiceById}= require('../controllers/serviceRoutes');


router.route('/newService').post(authMiddleware, roleMiddleware(["admin"]), createService);
router.route('/getServices').get(authMiddleware, getServices);
router.route('/getService/:id').get(authMiddleware, roleMiddleware(["admin"]), getServiceById);



module.exports = router;