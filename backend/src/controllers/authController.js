const { pool } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const [userRows] = await pool.query('CALL sp_SearchUsers(?, NULL)', [role || '']);
    const users = userRows[0];
    const userMatch = users.find(u => u.email === email);

    if (!userMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or role" });
    }

    const user = userMatch;
    
    // In a real app, compare password_hash with bcrypt
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const [detailsRows] = await pool.query('CALL sp_GetUserDetails(?, ?)', [user.user_id, user.role]);
    const profile = detailsRows[0][0] || null;

    if (user.status === 'pending_admin_approval') {
      return res.status(403).json({ success: false, message: "Account is pending administrator approval." });
    }

    return res.json({
      success: true,
      message: "Login successful",
      token: `session-token-for-user-${user.user_id}`,
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
    const { email, password, full_name, gender, course, year_section, year_level } = req.body;
    const [existingRows] = await pool.query('CALL sp_GetUserByEmail(?)', [email]);
    const existing = existingRows[0];
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Call stored procedure
    const student_number = `SN-${Date.now()}`;
    const resolvedYearLevel = year_level || year_section;
    if (!resolvedYearLevel) {
      return res.status(400).json({ success: false, message: 'year_level is required' });
    }

    await pool.query(
      'CALL sp_RegisterStudent(?, ?, ?, ?, ?, ?, ?)',
      [email, password, student_number, full_name, gender, course, resolvedYearLevel]
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
      'CALL sp_ChangeUserPassword(?, ?)',
      [user_id, new_password]
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

exports.updateProfile = async (req, res) => {
  try {
    const {
      user_id,
      role,
      email,
      password,
      full_name,
      student_number,
      course,
      year_level,
      gender,
      employee_id,
      department
    } = req.body;

    if (!user_id || !role || !email) {
      return res.status(400).json({ success: false, message: 'user_id, role, and email are required' });
    }

    await pool.query(
      'CALL sp_UpdateUserProfile(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        role,
        email,
        password || '',
        full_name || '',
        student_number || '',
        course || '',
        year_level || '',
        gender || '',
        employee_id || '',
        department || ''
      ]
    );

    const [detailsRows] = await pool.query('CALL sp_GetUserDetails(?, ?)', [user_id, role]);
    const profile = detailsRows[0][0] || null;

    const [userRows] = await pool.query('CALL sp_GetUserByEmail(?)', [email]);
    const user = userRows[0][0] || { user_id, email, role, status: 'active', requires_password_change: false };

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { ...user, profile }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
