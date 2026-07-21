const { db, storedProcedures } = require('../config/db');

exports.getStudentProfile = (req, res) => {
  const { id } = req.params;
  const student = db.students.find(s => s.student_id === parseInt(id) || s.user_id === parseInt(id));
  if (!student) return res.status(404).json({ success: false, message: "Student not found" });

  const placement = db.ojt_placements.find(p => p.student_id === student.student_id);
  let company = null;
  let progress = null;
  if (placement) {
    company = db.companies.find(c => c.company_id === placement.company_id);
    progress = storedProcedures.sp_GetStudentProgress(placement.placement_id);
  }

  return res.json({
    success: true,
    data: {
      ...student,
      placement,
      company,
      progress
    }
  });
};

exports.getStudentRequirements = (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id);

  const reqList = db.requirement_types.map(type => {
    const submission = db.student_requirements.find(sr => sr.student_id === studentId && sr.requirement_id === type.requirement_id);
    return {
      ...type,
      submission: submission || null
    };
  });

  return res.json({ success: true, data: reqList });
};

exports.submitRequirement = (req, res) => {
  const { student_id, requirement_id, file_path } = req.body;
  const submission = storedProcedures.sp_SubmitRequirement(student_id, requirement_id, file_path || "/uploads/sample_doc.pdf");
  return res.status(201).json({ success: true, message: "Requirement submitted successfully", data: submission });
};

exports.applyToCompany = (req, res) => {
  const { student_id, company_id } = req.body;
  const existingApp = db.applications.find(a => a.student_id === parseInt(student_id) && a.company_id === parseInt(company_id));
  if (existingApp) {
    return res.status(400).json({ success: false, message: "Application already exists for this company" });
  }

  const app = storedProcedures.sp_ApplyToCompany(student_id, company_id);
  return res.status(201).json({ success: true, message: "Application submitted to company", data: app });
};

exports.submitWeeklyReport = (req, res) => {
  const { placement_id, week_number, narrative } = req.body;
  const newReport = {
    report_id: db.weekly_reports.length + 1,
    placement_id: parseInt(placement_id),
    week_number: parseInt(week_number),
    narrative,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    reviewed_by: null
  };
  db.weekly_reports.push(newReport);
  return res.status(201).json({ success: true, message: "Weekly report submitted", data: newReport });
};
