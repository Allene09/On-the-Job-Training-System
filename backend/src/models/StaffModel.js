const { pool } = require('../config/db');

class StaffModel {
  static async getDashboardStats() {
    const [rows] = await pool.query('CALL sp_GetStaffDashboardStats()');
    return rows[0][0];
  }

  static async getStaffStudents() {
    const [rows] = await pool.query('CALL sp_GetStaffStudents()');
    return rows[0];
  }

  static async getAllStudents() {
    const [rows] = await pool.query('SELECT * FROM students');
    return rows;
  }

  static async getAllRequirements() {
    const query = `
      SELECT sr.*, s.full_name as student_name, s.student_number, r.name as requirement_name 
      FROM student_requirements sr 
      JOIN students s ON sr.student_id = s.student_id 
      JOIN requirement_types r ON sr.requirement_id = r.requirement_id
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getAllCompanies() {
    const [rows] = await pool.query('SELECT * FROM companies');
    return rows;
  }

  static async getPendingRequirements() {
    const [rows] = await pool.query('CALL sp_GetPendingRequirements()');
    return rows[0];
  }

  static async getAllApplications() {
    const query = `
      SELECT a.*, s.full_name as student_name, s.student_number, s.course, c.company_name, c.industry 
      FROM applications a 
      JOIN students s ON a.student_id = s.student_id 
      JOIN companies c ON a.company_id = c.company_id
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getAllEvaluations() {
    const [rows] = await pool.query('SELECT * FROM evaluations');
    return rows;
  }

  static async getAllPlacements() {
    const [rows] = await pool.query('SELECT * FROM ojt_placements');
    return rows;
  }

  static async getAllAttendance() {
    const [rows] = await pool.query('SELECT * FROM attendance');
    return rows;
  }

  static async reviewRequirement(submissionId, status, remarks, reviewedBy) {
    await pool.query('CALL sp_ReviewRequirement(?, ?, ?, ?)', [submissionId, status, remarks, reviewedBy]);
  }

  static async approveApplication(applicationId, approvedBy, startDate, endDate, requiredHours) {
    await pool.query('CALL sp_ApproveApplication(?, ?, ?, ?, ?)', [applicationId, approvedBy, startDate, endDate, requiredHours]);
  }

  static async submitEvaluation(placementId, evaluatorName, attScore, workScore, attitScore, remarks) {
    await pool.query('CALL sp_SubmitEvaluation(?, ?, ?, ?, ?, ?)', [
      placementId, evaluatorName, attScore, workScore, attitScore, remarks
    ]);
  }

  static async updateEvaluation(evaluationId, evaluatorName, attScore, workScore, attitScore, remarks) {
    const totalScore = parseFloat(attScore) + parseFloat(workScore) + parseFloat(attitScore);
    await pool.query(
      'UPDATE evaluations SET evaluator_name = ?, attendance_score = ?, work_quality_score = ?, attitude_score = ?, total_score = ?, remarks = ?, evaluated_at = CURRENT_TIMESTAMP WHERE evaluation_id = ?',
      [evaluatorName, attScore, workScore, attitScore, totalScore, remarks, evaluationId]
    );
  }

  static async rejectApplication(applicationId) {
    await pool.query('CALL sp_RejectApplication(?)', [applicationId]);
  }
}

module.exports = StaffModel;
