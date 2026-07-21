const { db } = require('../config/db');

exports.getRequirementTypes = (req, res) => {
  return res.json({ success: true, data: db.requirement_types });
};

exports.getStudentSubmissions = (req, res) => {
  const submissions = db.student_requirements.map(sub => {
    const student = db.students.find(s => s.student_id === sub.student_id);
    const reqType = db.requirement_types.find(r => r.requirement_id === sub.requirement_id);
    return {
      ...sub,
      student_name: student ? student.full_name : 'Unknown Student',
      student_number: student ? student.student_number : '',
      requirement_name: reqType ? reqType.name : 'Requirement'
    };
  });
  return res.json({ success: true, data: submissions });
};
