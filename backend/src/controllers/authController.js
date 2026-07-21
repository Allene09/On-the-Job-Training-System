const { db, storedProcedures } = require('../config/db');

exports.login = (req, res) => {
  const { email, password, role } = req.body;
  const user = db.users.find(u => u.email === email && (!role || u.role === role));
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or role" });
  }

  let profile = null;
  if (user.role === 'student') profile = db.students.find(s => s.user_id === user.user_id);
  else if (user.role === 'staff') profile = db.staff.find(s => s.user_id === user.user_id);
  else if (user.role === 'admin') profile = db.admins.find(a => a.user_id === user.user_id);

  return res.json({
    success: true,
    message: "Login successful",
    token: `mock-jwt-token-for-user-${user.user_id}`,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile
    }
  });
};

exports.registerStudent = (req, res) => {
  const { email, password, student_number, full_name, course, year_level } = req.body;
  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const result = storedProcedures.sp_RegisterStudent(email, password || "pass123", student_number, full_name, course, year_level);
  return res.status(201).json({
    success: true,
    message: "Student registered successfully (SP executed)",
    data: result
  });
};
