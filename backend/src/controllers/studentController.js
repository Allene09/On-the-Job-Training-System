const { pool } = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const student_id = req.user?.profile?.student_id || 1; // Fallback for testing

    const [rows] = await pool.query('CALL sp_GetStudentRequirements(?)', [student_id]);
    const requirements = rows[0];

    const [placementRows] = await pool.query('CALL sp_GetActivePlacementByStudentId(?)', [student_id]);
    const placements = placementRows[0];
    let placement = null;
    let attendance = [];
    let recent_evaluations = [];

    if (placements.length > 0) {
      placement = placements[0];
      const [attRows] = await pool.query('CALL sp_GetRecentAttendance(?)', [placement.placement_id]);
      attendance = attRows[0];
      const [evalsRows] = await pool.query('CALL sp_GetRecentEvaluations(?)', [placement.placement_id]);
      recent_evaluations = evalsRows[0];
    }

    res.json({
      success: true,
      data: {
        requirements_status: requirements,
        active_placement: placement,
        recent_attendance: attendance,
        recent_evaluations: recent_evaluations
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRequirements = async (req, res) => {
  try {
    const student_id = req.user?.profile?.student_id || req.query.student_id || 1;
    const [rows] = await pool.query('CALL sp_GetStudentRequirements(?)', [student_id]);
    const requirements = rows[0];
    
    // Map to expected structure
    const fullList = requirements.map(r => ({
      requirement_id: r.requirement_id,
      name: r.name,
      description: r.description,
      is_required: r.is_required,
      deadline: r.deadline,
      submission: r.submission_id ? {
        submission_id: r.submission_id,
        file_path: r.file_path,
        status: r.status,
        remarks: r.remarks,
        submitted_at: r.submitted_at
      } : null
    }));
    
    res.json({ success: true, data: fullList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPlacements = async (req, res) => {
  try {
    const student_id = req.user?.profile?.student_id || req.query.student_id || 1;
    const [rows] = await pool.query('CALL sp_GetStudentPlacements(?)', [student_id]);
    const placements = rows[0];
    
    const enriched = placements.map(p => ({
      ...p,
      company: { company_name: p.company_name }
    }));
    
    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitRequirement = async (req, res) => {
  try {
    const { student_id, requirement_id, file_path } = req.body;
    if (!file_path) {
      return res.status(400).json({ success: false, message: 'file_path is required' });
    }

    await pool.query('CALL sp_SubmitRequirement(?, ?, ?)', [student_id, requirement_id, file_path]);
    return res.status(201).json({ success: true, message: "Requirement submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.applyToCompany = async (req, res) => {
  try {
    const { student_id, company_id } = req.body;
    const [rows] = await pool.query('CALL sp_CheckExistingApplication(?)', [student_id, company_id]);
    const existing = rows[0];
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Application already exists for this company" });
    }
    await pool.query('CALL sp_ApplyToCompany(?, ?)', [student_id, company_id]);
    return res.status(201).json({ success: true, message: "Application submitted to company" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitWeeklyReport = async (req, res) => {
  try {
    const { placement_id, week_number, narrative } = req.body;
    const [rows] = await pool.query(
      'CALL sp_SubmitWeeklyReport(?, ?, ?)',
      [placement_id, week_number, narrative]
    );
    const result = rows[0][0];
    return res.status(201).json({ success: true, message: "Weekly report submitted", data: { report_id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getWeeklyReports = async (req, res) => {
  try {
    const { student_id } = req.query;
    const [rows] = await pool.query('CALL sp_GetWeeklyReportsByStudentId(?)', [student_id || null]);
    const reports = rows[0];
    return res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
