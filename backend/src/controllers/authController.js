const { pool } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let query = 'SELECT * FROM users WHERE email = ?';
    const params = [email];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const [users] = await pool.query(query, params);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or role" });
    }

    const user = users[0];
    
    // In a real app, compare password_hash with bcrypt
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    let profile = null;
    if (user.role === 'student') {
      const [students] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.user_id]);
      profile = students[0];
    } else if (user.role === 'staff') {
      const [staff] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [user.user_id]);
      profile = staff[0];
    } else if (user.role === 'admin') {
      const [admins] = await pool.query('SELECT * FROM admins WHERE user_id = ?', [user.user_id]);
      profile = admins[0];
    }

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
        requires_password_change: user.requires_password_change === 1,
        profile
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { email, password, full_name, gender, course, year_section } = req.body;
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Call stored procedure
    // Note: p_student_number is missing in original req.body, passing empty or generic for now
    const student_number = `SN-${Date.now()}`;
    await pool.query(
      'CALL sp_RegisterStudent(?, ?, ?, ?, ?, ?, ?)',
      [email, password, student_number, full_name, gender, course, year_section]
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully (SP executed)",
      data: { email, full_name }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ?, requires_password_change = 0 WHERE user_id = ?',
      [new_password, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
