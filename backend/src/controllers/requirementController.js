const { pool } = require('../config/db');

exports.getRequirementTypes = async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM requirement_types');
    return res.json({ success: true, data: types });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStudentSubmissions = async (req, res) => {
  try {
    const [submissions] = await pool.query(`
      SELECT sr.*, s.full_name as student_name, s.student_number, rt.name as requirement_name
      FROM student_requirements sr
      JOIN students s ON sr.student_id = s.student_id
      JOIN requirement_types rt ON sr.requirement_id = rt.requirement_id
    `);
    return res.json({ success: true, data: submissions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_required } = req.body;
    await pool.query('UPDATE requirement_types SET is_required = ? WHERE requirement_id = ?', [is_required ? 1 : 0, id]);
    return res.json({ success: true, message: 'Requirement updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
