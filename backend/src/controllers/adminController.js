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
