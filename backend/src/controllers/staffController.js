const { db, storedProcedures } = require('../config/db');

exports.getStaffDashboard = (req, res) => {
  const pendingRequirements = db.student_requirements.filter(sr => sr.status === 'pending');
  const pendingApplications = db.applications.filter(a => a.status === 'pending');
  const activePlacements = db.ojt_placements.filter(p => p.status === 'ongoing');

  return res.json({
    success: true,
    data: {
      total_students: db.students.length,
      pending_requirements_count: pendingRequirements.length,
      pending_applications_count: pendingApplications.length,
      active_placements_count: activePlacements.length,
      announcements: db.announcements
    }
  });
};

exports.reviewRequirement = (req, res) => {
  const { submission_id, status, remarks, reviewed_by } = req.body;
  const updated = storedProcedures.sp_ReviewRequirement(submission_id, status, remarks, reviewed_by || 2);
  if (!updated) return res.status(404).json({ success: false, message: "Submission not found" });
  return res.json({ success: true, message: `Requirement ${status}`, data: updated });
};

exports.approveApplication = (req, res) => {
  const { application_id, approved_by, start_date, end_date, required_hours } = req.body;
  const result = storedProcedures.sp_ApproveApplication(application_id, approved_by || 2, start_date, end_date, required_hours);
  if (!result) return res.status(404).json({ success: false, message: "Application not found" });
  return res.json({ success: true, message: "Application accepted and placement created", data: result });
};

exports.submitEvaluation = (req, res) => {
  const { placement_id, evaluator_name, attendance_score, work_quality_score, attitude_score, remarks } = req.body;
  const evalRecord = storedProcedures.sp_SubmitEvaluation(placement_id, evaluator_name, attendance_score, work_quality_score, attitude_score, remarks);
  return res.status(201).json({ success: true, message: "Evaluation saved successfully", data: evalRecord });
};
