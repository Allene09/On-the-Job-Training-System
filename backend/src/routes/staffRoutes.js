const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/dashboard', staffController.getStaffDashboard);
router.post('/requirements/review', staffController.reviewRequirement);
router.post('/applications/approve', staffController.approveApplication);
router.post('/evaluation/submit', staffController.submitEvaluation);

module.exports = router;
