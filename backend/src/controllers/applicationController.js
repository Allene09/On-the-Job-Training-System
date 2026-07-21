const { db } = require('../config/db');

exports.getApplications = (req, res) => {
  const fullApps = db.applications.map(app => {
    const student = db.students.find(s => s.student_id === app.student_id);
    const company = db.companies.find(c => c.company_id === app.company_id);
    return {
      ...app,
      student_name: student ? student.full_name : 'Unknown',
      student_number: student ? student.student_number : '',
      course: student ? student.course : '',
      company_name: company ? company.company_name : 'Unknown'
    };
  });
  return res.json({ success: true, data: fullApps });
};
