const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class AdminModel {
  static async getDashboardStats() {
    const [rows] = await pool.query('CALL sp_GetAdminDashboardStats()');
    return rows[0][0];
  }

  static async getUsers() {
    const [rows] = await pool.query(`
      SELECT u.*, 
          s.student_id, s.full_name AS student_name, s.student_number, s.course,
          st.staff_id, st.full_name AS staff_name, st.employee_id,
          a.admin_id, a.full_name AS admin_name
      FROM users u
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN staff st ON u.user_id = st.user_id
      LEFT JOIN admins a ON u.user_id = a.user_id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }

  static async createRequirementType(data) {
    const { name, description, is_required, deadline } = data;
    const isReq = is_required !== undefined ? is_required : true;
    const dl = deadline || "2026-09-30";
    
    const [result] = await pool.query(
      'INSERT INTO requirement_types (name, description, is_required, deadline) VALUES (?, ?, ?, ?)',
      [name, description, isReq, dl]
    );
    return { insertId: result.insertId, isReq, dl };
  }

  static async getPendingAccounts() {
    const [rows] = await pool.query('CALL sp_GetPendingAccounts()');
    return rows[0];
  }

  static async approveAccount(userId) {
    await pool.query('CALL sp_ApproveStudentAccount(?)', [userId]);
  }

  static async createUser(data) {
    const { email, password, role, full_name, employee_id, student_number, course, year_level, gender, department } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check existing
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error("Email already registered");

    const initialStatus = role === 'staff' ? 'pending_admin_approval' : 'active';

    // Insert user
    const [userRes] = await pool.query(
      'INSERT INTO users (email, password_hash, role, status, requires_password_change) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, role, initialStatus, 1]
    );
    const userId = userRes.insertId;

    if (role === 'admin') {
      await pool.query('INSERT INTO admins (user_id, full_name) VALUES (?, ?)', [userId, full_name]);
    } else if (role === 'staff') {
      await pool.query('INSERT INTO staff (user_id, full_name, employee_id, department) VALUES (?, ?, ?, ?)', [userId, full_name, employee_id || '', department || '']);
    } else if (role === 'student') {
      await pool.query('INSERT INTO students (user_id, student_number, full_name, gender, course, year_level) VALUES (?, ?, ?, ?, ?, ?)', [userId, student_number || `SN-${Date.now()}`, full_name, gender || '', course || '', year_level || '']);
    }

    // Return created user
    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    const user = users[0];
    
    let profile = null;
    if (role === 'admin') {
      const [admins] = await pool.query('SELECT * FROM admins WHERE user_id = ?', [userId]);
      profile = admins[0];
    } else if (role === 'staff') {
      const [staff] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [userId]);
      profile = staff[0];
    } else if (role === 'student') {
      const [students] = await pool.query('SELECT * FROM students WHERE user_id = ?', [userId]);
      profile = students[0];
    }

    return { user, profile };
  }

  static async getAnnouncements() {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    return rows;
  }

  static async getNotifications(userId) {
    let query = 'SELECT * FROM notifications';
    const params = [];
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = AdminModel;
