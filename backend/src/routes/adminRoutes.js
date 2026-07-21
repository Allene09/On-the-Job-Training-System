const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getUsers);
router.post('/requirements/type', adminController.createRequirementType);

module.exports = router;
