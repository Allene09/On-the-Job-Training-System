const { pool } = require('../config/db');

class ApplicationModel {
  static async getAll() {
    const [applications] = await pool.query(`
      SELECT a.*, s.full_name as student_name, s.student_number, s.course, c.company_name
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN companies c ON a.company_id = c.company_id
    `);
    return applications;
  }
}

module.exports = ApplicationModel;
