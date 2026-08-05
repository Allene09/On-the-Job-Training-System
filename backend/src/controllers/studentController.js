const StudentModel = require('../models/StudentModel');

exports.getDashboardData = async (req, res) => {
  try {
    const student_id = req.user?.profile?.student_id || 1; // Fallback for testing

    const requirements = await StudentModel.getStudentRequirements(student_id);

    const placements = await StudentModel.getActivePlacement(student_id);
    let placement = null;
    let attendance = [];
    let recent_evaluations = [];

    if (placements.length > 0) {
      placement = placements[0];
      attendance = await StudentModel.getRecentAttendance(placement.placement_id);
      recent_evaluations = await StudentModel.getRecentEvaluations(placement.placement_id);
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
    const requirements = await StudentModel.getStudentRequirements(student_id);
    
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
    const placements = await StudentModel.getStudentPlacements(student_id);
    
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

    // Prevent Duplication: Check if already submitted
    const requirements = await StudentModel.getStudentRequirements(student_id);
    const existing = requirements.find(r => r.requirement_id == requirement_id && r.submission_id);

    if (existing) {
      // Update existing submission instead of creating a duplicate
      await StudentModel.updateRequirementSubmission(existing.submission_id, file_path);
      return res.status(200).json({ success: true, message: "Requirement updated successfully" });
    }

    await StudentModel.submitRequirement(student_id, requirement_id, file_path);
    return res.status(201).json({ success: true, message: "Requirement submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.applyToCompany = async (req, res) => {
  try {
    const { student_id, company_id } = req.body;
    const existing = await StudentModel.checkExistingApplication(student_id, company_id);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Application already exists for this company" });
    }
    await StudentModel.applyToCompany(student_id, company_id);
    return res.status(201).json({ success: true, message: "Application submitted to company" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitWeeklyReport = async (req, res) => {
  try {
    const { placement_id, week_number, narrative } = req.body;
    
    // Prevent Duplication: Check if report for this week already exists
    const existingReports = await StudentModel.getWeeklyReports(req.user?.profile?.student_id || req.query.student_id || 1);
    const existing = existingReports.find(r => r.placement_id == placement_id && r.week_number == week_number);

    if (existing) {
      // Update existing report
      await StudentModel.updateWeeklyReport(existing.report_id, narrative);
      return res.status(200).json({ success: true, message: "Weekly report updated", data: { report_id: existing.report_id } });
    }

    const result = await StudentModel.submitWeeklyReport(placement_id, week_number, narrative);
    return res.status(201).json({ success: true, message: "Weekly report submitted", data: { report_id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getWeeklyReports = async (req, res) => {
  try {
    const { student_id } = req.query;
    const reports = await StudentModel.getWeeklyReports(student_id);
    return res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
