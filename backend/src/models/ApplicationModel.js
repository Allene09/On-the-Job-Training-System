const { pool } = require('../config/db');

class ApplicationModel {
  static async getAll() {
    const [applications] = await pool.query(`
      SELECT a.*, s.full_name as student_name, s.student_number, s.course, c.company_name, c.industry, c.photo_url, c.address
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN companies c ON a.company_id = c.company_id
      ORDER BY a.applied_at DESC
    `);
    if (!applications || applications.length === 0) return [];

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
}

module.exports = ApplicationModel;
