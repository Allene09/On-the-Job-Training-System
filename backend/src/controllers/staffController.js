const { pool } = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const [[{ total_students }]] = await pool.query('SELECT COUNT(*) as total_students FROM students');
    const [[{ active_placements }]] = await pool.query('SELECT COUNT(*) as active_placements FROM ojt_placements WHERE status = "ongoing"');
    const [[{ pending_requirements }]] = await pool.query('SELECT COUNT(*) as pending_requirements FROM student_requirements WHERE status = "pending"');
    
    res.json({
      success: true,
      data: {
        total_students,
        active_placements,
        pending_requirements: pending_requirements
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStudentProfiles = async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT s.*, u.email, u.status as account_status,
             p.placement_id as active_placement_id,
             p.status as active_placement_status
      FROM students s
      LEFT JOIN users u ON s.user_id = u.user_id
      LEFT JOIN ojt_placements p ON s.student_id = p.student_id AND p.status = 'ongoing'
    `);
    
    const enriched = students.map(s => ({
      ...s,
      active_placement: s.active_placement_id ? {
        placement_id: s.active_placement_id,
        status: s.active_placement_status
      } : null
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPendingRequirements = async (req, res) => {
  try {
    const [pending] = await pool.query(`
      SELECT sr.*, s.full_name as student_name, rt.name as requirement_name 
      FROM student_requirements sr
      JOIN students s ON sr.student_id = s.student_id
      JOIN requirement_types rt ON sr.requirement_id = rt.requirement_id
      WHERE sr.status = 'pending'
    `);
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.reviewRequirement = async (req, res) => {
  try {
    const { submission_id, status, remarks, reviewed_by } = req.body;
    await pool.query('CALL sp_ReviewRequirement(?, ?, ?, ?)', [submission_id, status, remarks, reviewed_by || 2]);
    return res.json({ success: true, message: \`Requirement \${status}\` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { application_id, approved_by, start_date, end_date, required_hours } = req.body;
    const sd = start_date || new Date().toISOString().split('T')[0];
    const ed = end_date || '2026-11-30';
    const hrs = required_hours || 486;
    
    await pool.query('CALL sp_ApproveApplication(?, ?, ?, ?, ?)', [application_id, approved_by || 2, sd, ed, hrs]);
    return res.json({ success: true, message: "Application accepted and placement created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitEvaluation = async (req, res) => {
  try {
    const { placement_id, evaluator_name, attendance_score, work_quality_score, attitude_score, remarks } = req.body;
    await pool.query('CALL sp_SubmitEvaluation(?, ?, ?, ?, ?, ?)', [placement_id, evaluator_name, attendance_score, work_quality_score, attitude_score, remarks]);
    return res.status(201).json({ success: true, message: "Evaluation saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
