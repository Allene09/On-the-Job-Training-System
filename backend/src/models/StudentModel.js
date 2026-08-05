const { pool } = require('../config/db');

class StudentModel {
  static async getStudentRequirements(studentId) {
    const [rows] = await pool.query('CALL sp_GetStudentRequirements(?)', [studentId]);
    return rows[0];
  }

  static async getActivePlacement(studentId) {
    const [rows] = await pool.query('CALL sp_GetActivePlacementByStudentId(?)', [studentId]);
    return rows[0];
  }

  static async getRecentAttendance(placementId) {
    const [rows] = await pool.query('CALL sp_GetRecentAttendance(?)', [placementId]);
    return rows[0];
  }

  static async getRecentEvaluations(placementId) {
    const [rows] = await pool.query('CALL sp_GetRecentEvaluations(?)', [placementId]);
    return rows[0];
  }

  static async getStudentPlacements(studentId) {
    const [rows] = await pool.query('CALL sp_GetStudentPlacements(?)', [studentId]);
    return rows[0];
  }

  static async submitRequirement(studentId, requirementId, filePath) {
    await pool.query('CALL sp_SubmitRequirement(?, ?, ?)', [studentId, requirementId, filePath]);
  }

  static async updateRequirementSubmission(submissionId, filePath) {
    await pool.query('UPDATE student_requirements SET file_path = ?, status = "pending", remarks = NULL WHERE submission_id = ?', [filePath, submissionId]);
  }

  static async checkExistingApplication(studentId, companyId) {
    const [rows] = await pool.query('CALL sp_CheckExistingApplication(?, ?)', [studentId, companyId]);
    return rows[0];
  }

  static async applyToCompany(studentId, companyId) {
    await pool.query('CALL sp_ApplyToCompany(?, ?)', [studentId, companyId]);
  }

  static async submitWeeklyReport(placementId, weekNumber, narrative) {
    const [rows] = await pool.query(
      'CALL sp_SubmitWeeklyReport(?, ?, ?)',
      [placementId, weekNumber, narrative]
    );
    return rows[0][0];
  }

  static async updateWeeklyReport(reportId, narrative) {
    await pool.query('UPDATE weekly_reports SET narrative = ?, status = "submitted" WHERE report_id = ?', [narrative, reportId]);
  }

  static async getWeeklyReports(studentId) {
    const [rows] = await pool.query('CALL sp_GetWeeklyReportsByStudentId(?)', [studentId || null]);
    return rows[0];
  }
}

module.exports = StudentModel;
