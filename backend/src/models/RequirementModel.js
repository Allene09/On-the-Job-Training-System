const { pool } = require('../config/db');

class RequirementModel {
  static async getAllTypes() {
    const [types] = await pool.query('SELECT * FROM requirement_types');
    return types;
  }

  static async getSubmissions() {
    const [submissions] = await pool.query(`
      SELECT sr.*, s.full_name as student_name, s.student_number, rt.name as requirement_name
      FROM student_requirements sr
      JOIN students s ON sr.student_id = s.student_id
      JOIN requirement_types rt ON sr.requirement_id = rt.requirement_id
      ORDER BY sr.submission_id DESC
    `);
    return submissions;
  }

  static async updateRequirementType(id, is_required) {
    const [result] = await pool.query('UPDATE requirement_types SET is_required = ? WHERE requirement_id = ?', [is_required ? 1 : 0, id]);
    return result;
  }
}

module.exports = RequirementModel;
