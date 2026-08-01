const { pool } = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_GetAdminDashboardStats()');
    const stats = rows[0][0];

    return res.json({
      success: true,
      data: {
        total_users: stats.total_users,
        total_students: stats.total_students,
        total_staff: stats.total_staff,
        total_companies: stats.total_companies,
        active_companies: stats.active_companies,
        ongoing_placements: stats.ongoing_placements,
        completed_placements: stats.completed_placements,
        total_hours_rendered: stats.total_hours_rendered || 0
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_SearchUsers(NULL, NULL)');
    const users = rows[0].map(u => ({
      user_id: u.user_id,
      email: u.email,
      role: u.role,
      status: u.status,
      requires_password_change: u.requires_password_change,
      created_at: u.created_at,
      details: {
        full_name: u.student_name || u.staff_name || u.admin_name,
        student_number: u.student_number,
        employee_id: u.employee_id
      }
    }));
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
    const [rows] = await pool.query('CALL sp_GetPendingAccounts()');
    const pendingUsers = rows[0].map(u => ({
      user_id: u.user_id,
      email: u.email,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      details: {
        full_name: u.full_name,
        student_number: u.student_number,
        course: u.course,
        year_level: u.year_level
      }
    }));
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
