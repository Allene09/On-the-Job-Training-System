const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');

router.use(verifyToken, isStudent);
router.get('/dashboard', studentController.getDashboardData);
router.get('/requirements', studentController.getRequirements);
router.get('/placements', studentController.getPlacements);
router.get('/weekly-reports', studentController.getWeeklyReports);
router.post('/requirements/submit', studentController.submitRequirement);
router.post('/apply', studentController.applyToCompany);
router.post('/weekly-report', studentController.submitWeeklyReport);

module.exports = router;
