const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/:placement_id', attendanceController.getPlacementAttendance);
router.post('/record', attendanceController.recordAttendance);

module.exports = router;
