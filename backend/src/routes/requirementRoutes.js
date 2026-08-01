const express = require('express');
const router = express.Router();
const requirementController = require('../controllers/requirementController');

router.get('/types', requirementController.getRequirementTypes);
router.get('/submissions', requirementController.getStudentSubmissions);
router.put('/:id', requirementController.updateRequirement);

module.exports = router;
