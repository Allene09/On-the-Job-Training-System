const { pool } = require('../config/db');

exports.getApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(`
      SELECT a.*, s.full_name as student_name, s.student_number, s.course, c.company_name
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN companies c ON a.company_id = c.company_id
    `);
    return res.json({ success: true, data: apps });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
