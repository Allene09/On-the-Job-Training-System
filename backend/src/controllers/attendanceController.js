const { pool } = require('../config/db');

exports.getPlacementAttendance = async (req, res) => {
  try {
    const { placement_id } = req.params;
    const [records] = await pool.query('SELECT * FROM attendance WHERE placement_id = ?', [placement_id]);
    
    // Simulate sp_GetStudentProgress logic
    let progress = null;
    const [placements] = await pool.query('SELECT required_hours, total_hours_rendered, status FROM ojt_placements WHERE placement_id = ?', [placement_id]);
    if (placements.length > 0) {
      const p = placements[0];
      progress = {
        placement_id: parseInt(placement_id),
        required_hours: p.required_hours,
        total_hours_rendered: p.total_hours_rendered,
        progress_percent: Math.min(parseFloat(((p.total_hours_rendered / p.required_hours) * 100).toFixed(2)), 100),
        status: p.status
      };
    }

    return res.json({ success: true, data: { records, progress } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { placement_id, log_date, time_in, time_out } = req.body;
    await pool.query('CALL sp_RecordAttendance(?, ?, ?, ?)', [placement_id, log_date, time_in, time_out]);
    
    // Fetch the newly inserted record to return
    const [newRecord] = await pool.query('SELECT * FROM attendance WHERE placement_id = ? AND log_date = ? ORDER BY attendance_id DESC LIMIT 1', [placement_id, log_date]);

    return res.status(201).json({
      success: true,
      message: "Attendance recorded & total hours auto-calculated (SP executed)",
      data: newRecord[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
