const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/:id', studentController.getStudentProfile);
router.get('/:id/requirements', studentController.getStudentRequirements);
router.post('/requirements/submit', studentController.submitRequirement);
router.post('/apply', studentController.applyToCompany);
router.post('/weekly-report', studentController.submitWeeklyReport);

module.exports = router;
