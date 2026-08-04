const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');

router.use(verifyToken, isStaff);
router.get('/dashboard', staffController.getDashboardData);
router.get('/students', staffController.getStudentProfiles);
router.get('/requirements/pending', staffController.getPendingRequirements);
router.post('/requirements/review', staffController.reviewRequirement);
router.post('/applications/approve', staffController.approveApplication);
router.post('/applications/reject', staffController.rejectApplication);
router.post('/evaluation/submit', staffController.submitEvaluation);

module.exports = router;
