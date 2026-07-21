const { db, storedProcedures } = require('../config/db');

exports.getPlacementAttendance = (req, res) => {
  const { placement_id } = req.params;
  const records = db.attendance.filter(a => a.placement_id === parseInt(placement_id));
  const progress = storedProcedures.sp_GetStudentProgress(placement_id);
  return res.json({ success: true, data: { records, progress } });
};

exports.recordAttendance = (req, res) => {
  const { placement_id, log_date, time_in, time_out } = req.body;
  const record = storedProcedures.sp_RecordAttendance(placement_id, log_date, time_in, time_out);
  return res.status(201).json({
    success: true,
    message: "Attendance recorded & total hours auto-calculated (SP executed)",
    data: record
  });
};
