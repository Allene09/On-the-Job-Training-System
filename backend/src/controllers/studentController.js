const { pool } = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const student_id = req.user?.profile?.student_id || 1; // Fallback for testing

    const [requirements] = await pool.query(`
      SELECT sr.*, rt.name as requirement_name, rt.is_required
      FROM student_requirements sr
      JOIN requirement_types rt ON sr.requirement_id = rt.requirement_id
      WHERE sr.student_id = ?
    `, [student_id]);

    const [placements] = await pool.query('SELECT * FROM ojt_placements WHERE student_id = ? AND status != "terminated" ORDER BY placement_id DESC LIMIT 1', [student_id]);
    let placement = null;
    let attendance = [];
    let recent_evaluations = [];

    if (placements.length > 0) {
      placement = placements[0];
      const [att] = await pool.query('SELECT * FROM attendance WHERE placement_id = ? ORDER BY log_date DESC LIMIT 5', [placement.placement_id]);
      attendance = att;
      const [evals] = await pool.query('SELECT * FROM evaluations WHERE placement_id = ? ORDER BY evaluated_at DESC LIMIT 5', [placement.placement_id]);
      recent_evaluations = evals;
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
    const [requirements] = await pool.query(`
      SELECT rt.requirement_id, rt.name, rt.description, rt.is_required, rt.deadline,
             sr.submission_id, sr.file_path, sr.status, sr.remarks, sr.submitted_at
      FROM requirement_types rt
      LEFT JOIN student_requirements sr ON rt.requirement_id = sr.requirement_id AND sr.student_id = ?
    `, [student_id]);
    
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
    const [placements] = await pool.query('SELECT p.*, c.company_name FROM ojt_placements p JOIN companies c ON p.company_id = c.company_id WHERE p.student_id = ?', [student_id]);
    
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
    await pool.query('CALL sp_SubmitRequirement(?, ?, ?)', [student_id, requirement_id, file_path || "/uploads/sample_doc.pdf"]);
    return res.status(201).json({ success: true, message: "Requirement submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.applyToCompany = async (req, res) => {
  try {
    const { student_id, company_id } = req.body;
    const [existing] = await pool.query('SELECT * FROM applications WHERE student_id = ? AND company_id = ?', [student_id, company_id]);
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
    const [result] = await pool.query(
      'INSERT INTO weekly_reports (placement_id, week_number, narrative, status) VALUES (?, ?, ?, ?)',
      [placement_id, week_number, narrative, 'submitted']
    );
    return res.status(201).json({ success: true, message: "Weekly report submitted", data: { report_id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
