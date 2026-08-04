const AttendanceModel = require('../models/AttendanceModel');

exports.getPlacementAttendance = async (req, res) => {
  try {
    const { placement_id } = req.params;
    const records = await AttendanceModel.getByPlacementId(placement_id);
    const progress = await AttendanceModel.getProgress(placement_id);

    return res.json({ success: true, data: { records, progress } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { placement_id, log_date, time_in, time_out, hours_rendered, remarks } = req.body;
    
    const placement = await AttendanceModel.getPlacementById(placement_id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }

    if (placement.status !== 'ongoing') {
      return res.status(400).json({ success: false, message: 'Cannot add attendance to a completed or inactive placement.' });
    }

    const newRecord = await AttendanceModel.addRecord(placement_id, log_date, time_in, time_out, parseFloat(hours_rendered), remarks || null);

    return res.status(201).json({
      success: true,
      message: "Attendance recorded",
      data: newRecord
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
