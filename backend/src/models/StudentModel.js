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

  static async applyToCompany(studentId, companyId, note = null, files = []) {
    const [result] = await pool.query('CALL sp_ApplyToCompany(?, ?, ?)', [studentId, companyId, note]);
    const applicationId = result[0]?.[0]?.application_id;

    if (applicationId && files && files.length > 0) {
      for (const file of files) {
        const fileName = file.originalname || file.name || file.filename;
        const filePath = file.filename ? `/uploads/${file.filename}` : (file.file_path || file.url || `/uploads/${file.name || 'document'}`);
        const fileSize = file.size || null;
        await pool.query('CALL sp_AddApplicationDocument(?, ?, ?, ?)', [applicationId, fileName, filePath, fileSize]);
      }
    }

    return { application_id: applicationId, student_id: studentId, company_id: companyId, note };
  }

  static async getStudentApplications(studentId) {
    const [rows] = await pool.query('CALL sp_GetApplicationsByStudentId(?)', [studentId]);
    const applications = rows[0] || [];
    if (applications.length === 0) return [];

    const appIds = applications.map(a => a.application_id);
    const [docRows] = await pool.query(
      `SELECT * FROM application_documents WHERE application_id IN (${appIds.map(() => '?').join(',')})`,
      appIds
    );

    const docMap = {};
    docRows.forEach(doc => {
      if (!docMap[doc.application_id]) docMap[doc.application_id] = [];
      docMap[doc.application_id].push({
        document_id: doc.document_id,
        name: doc.file_name,
        original_name: doc.file_name,
        file_path: doc.file_path,
        size: doc.file_size,
        uploaded_at: doc.uploaded_at
      });
    });

    return applications.map(a => ({
      ...a,
      documents: docMap[a.application_id] || []
    }));
  }

  static async getApplicationDocuments(applicationId) {
    const [rows] = await pool.query('CALL sp_GetApplicationDocuments(?)', [applicationId]);
    return rows[0] || [];
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
