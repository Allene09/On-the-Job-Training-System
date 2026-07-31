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

  if (user.status === 'pending_admin_approval') {
    return res.status(403).json({ success: false, message: "Account is pending administrator approval." });
  }

  return res.json({
    success: true,
    message: "Login successful",
    token: `mock-jwt-token-for-user-${user.user_id}`,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      requires_password_change: user.requires_password_change,
      profile
    }
  });
};

exports.registerStudent = (req, res) => {
  const { email, password, full_name, gender, course, year_section } = req.body;
  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const result = storedProcedures.sp_RegisterStudent(email, password, full_name, gender, course, year_section);
  return res.status(201).json({
    success: true,
    message: "Student registered successfully (SP executed)",
    data: result
  });
};

exports.changePassword = (req, res) => {
  const { user_id, new_password } = req.body;
  const user = db.users.find(u => u.user_id === parseInt(user_id));
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.password_hash = new_password; // In real app, hash this
  user.requires_password_change = false;

  return res.json({ success: true, message: "Password updated successfully" });
};
