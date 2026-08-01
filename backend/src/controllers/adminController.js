const { pool } = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const [[{ completed_placements }]] = await pool.query('SELECT COUNT(*) as completed_placements FROM ojt_placements WHERE status = "completed"');
    const [[{ ongoing_placements }]] = await pool.query('SELECT COUNT(*) as ongoing_placements FROM ojt_placements WHERE status = "ongoing"');
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_students }]] = await pool.query('SELECT COUNT(*) as total_students FROM students');
    const [[{ total_staff }]] = await pool.query('SELECT COUNT(*) as total_staff FROM staff');
    const [[{ total_companies }]] = await pool.query('SELECT COUNT(*) as total_companies FROM companies');
    const [[{ active_companies }]] = await pool.query('SELECT COUNT(*) as active_companies FROM companies WHERE status = "active"');
    const [[{ total_hours_rendered }]] = await pool.query('SELECT SUM(hours_rendered) as total_hours_rendered FROM attendance');

    return res.json({
      success: true,
      data: {
        total_users,
        total_students,
        total_staff,
        total_companies,
        active_companies,
        ongoing_placements,
        completed_placements,
        total_hours_rendered: total_hours_rendered || 0
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT user_id, email, role, status, requires_password_change, created_at FROM users');
    for (let u of users) {
      if (u.role === 'student') {
        const [details] = await pool.query('SELECT * FROM students WHERE user_id = ?', [u.user_id]);
        u.details = details[0];
      } else if (u.role === 'staff') {
        const [details] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [u.user_id]);
        u.details = details[0];
      } else if (u.role === 'admin') {
        const [details] = await pool.query('SELECT * FROM admins WHERE user_id = ?', [u.user_id]);
        u.details = details[0];
      }
    }
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createRequirementType = async (req, res) => {
  try {
    const { name, description, is_required, deadline } = req.body;
    const isReq = is_required !== undefined ? is_required : true;
    const dl = deadline || "2026-09-30";
    
    const [result] = await pool.query(
      'INSERT INTO requirement_types (name, description, is_required, deadline) VALUES (?, ?, ?, ?)',
      [name, description, isReq, dl]
    );

    return res.status(201).json({ success: true, message: "Requirement type added", data: { requirement_id: result.insertId, name, description, is_required: isReq, deadline: dl } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPendingAccounts = async (req, res) => {
  try {
    const [pendingUsers] = await pool.query('SELECT user_id, email, role, status, created_at FROM users WHERE status = "pending_admin_approval"');
    for (let u of pendingUsers) {
      const [details] = await pool.query('SELECT * FROM students WHERE user_id = ?', [u.user_id]);
      u.details = details[0];
    }
    return res.json({ success: true, data: pendingUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveAccount = async (req, res) => {
  try {
    const { user_id } = req.body;
    await pool.query('CALL sp_ApproveStudentAccount(?)', [user_id]);
    
    // Simulate sending email
    console.log(`[SIMULATED EMAIL] Account approved! Email sent to user_id ${user_id} with default password.`);

    return res.json({ success: true, message: "Account approved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      role,
      full_name,
      email,
      password,
      student_number,
      course,
      year_level,
      gender,
      employee_id,
      department
    } = req.body;

    if (!role || !full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'role, full_name, email, and password are required' });
    }

    if (role === 'student') {
      const resolvedStudentNumber = student_number || `SN-${Date.now()}`;
      if (!course || !year_level) {
        return res.status(400).json({ success: false, message: 'course and year_level are required for students' });
      }

      await pool.query(
        'CALL sp_RegisterStudent(?, ?, ?, ?, ?, ?, ?)',
        [email, password, resolvedStudentNumber, full_name, gender || null, course, year_level]
      );

      const [users] = await pool.query('SELECT * FROM users WHERE email = ? ORDER BY user_id DESC LIMIT 1', [email]);
      const user = users[0];
      const [students] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.user_id]);

      return res.status(201).json({ success: true, message: 'Student account created successfully', data: { ...user, profile: students[0] || null } });
    }

    if (role === 'staff') {
      await pool.query(
        'CALL sp_RegisterStaff(?, ?, ?, ?, ?)',
        [email, password, full_name, employee_id || null, department || null]
      );

      const [users] = await pool.query('SELECT * FROM users WHERE email = ? ORDER BY user_id DESC LIMIT 1', [email]);
      const user = users[0];
      const [staff] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [user.user_id]);

      return res.status(201).json({ success: true, message: 'Staff account created successfully', data: { ...user, profile: staff[0] || null } });
    }

    return res.status(400).json({ success: false, message: 'Unsupported role' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: announcements });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { user_id } = req.query;
    const params = [];
    let query = 'SELECT * FROM notifications';

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY created_at DESC';

    const [notifications] = await pool.query(query, params);
    return res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
