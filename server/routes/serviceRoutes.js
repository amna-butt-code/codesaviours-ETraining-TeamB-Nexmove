const express = require('express');
const router = express.Router();
const {createService,getServices,getServiceById}= require('../controllers/serviceRoutes');


router.route('/newService').post(createService);
router.route('/getServices').get(getServices);
router.route('/getService/:id').get(getServiceById);



module.exports = router;