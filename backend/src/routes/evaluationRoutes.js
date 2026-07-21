const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.get('/:placement_id', evaluationController.getPlacementEvaluations);

module.exports = router;
