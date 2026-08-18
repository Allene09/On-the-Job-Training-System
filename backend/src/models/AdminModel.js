const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class AdminModel {
  static async getDashboardStats() {
    const [rows] = await pool.query('CALL sp_GetAdminDashboardStats()');
    return rows[0][0];
  }

  static async getMonthlyStatisticalReport(year) {
    const [rows] = await pool.query('CALL sp_GetMonthlyStatisticalReport(?)', [year]);
    return rows[0];
  }

  static async getUsers() {
    const [rows] = await pool.query('CALL sp_GetAllUsers()');
    return rows[0];
  }

  static async updateUserStatus(userId, status) {
    await pool.query('CALL sp_UpdateUserStatus(?, ?)', [userId, status]);
    return { user_id: userId, status };
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

  static async approveAccount(userId, adminId = 1, hashedPassword, plainPassword = '') {
    await pool.query('CALL sp_ApproveStudentAccount(?, ?, ?)', [userId, hashedPassword, plainPassword]);

    // Check if user is a student to auto-approve pending company applications
    const [userRows] = await pool.query('SELECT role FROM users WHERE user_id = ?', [userId]);
    const role = userRows[0]?.role;
    
    if (role === 'student') {
      const [studentRows] = await pool.query('SELECT student_id, required_hours FROM students WHERE user_id = ?', [userId]);
      const student = studentRows[0];
      if (student) {
        const [appRows] = await pool.query("SELECT application_id FROM applications WHERE student_id = ? AND status = 'pending'", [student.student_id]);
        
        for (const app of appRows) {
          const startDate = new Date().toISOString().split('T')[0];
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 4);
          const endDateStr = endDate.toISOString().split('T')[0];
          
          await pool.query(
            'CALL sp_ApproveApplication(?, ?, ?, ?, ?)',
            [app.application_id, adminId, startDate, endDateStr, student.required_hours || 486]
          );
        }
      }
    }
  }

  static async rejectAccount(userId) {
    await pool.query('CALL sp_RejectStudentAccount(?)', [userId]);
  }

  static async createUser(data) {
    const {
      email, password, role, full_name, first_name, middle_name, last_name,
      employee_id, student_number, course, year_level, gender, department, contact_number, address
    } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check existing
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error("Email already registered");

    const initialStatus = role === 'staff' ? 'pending_admin_approval' : 'active';
    const plainPassToStore = initialStatus === 'active' ? password : null;

    // Insert user
    const [userRes] = await pool.query(
      'INSERT INTO users (email, password_hash, plain_password, role, status, requires_password_change) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, plainPassToStore, role, initialStatus, 1]
    );
    const userId = userRes.insertId;

    const constructedFullName = full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ');

    if (role === 'admin') {
      await pool.query(
        'INSERT INTO admins (user_id, full_name, first_name, middle_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [userId, constructedFullName, first_name || '', middle_name || '', last_name || '']
      );
    } else if (role === 'staff') {
      await pool.query(
        'INSERT INTO staff (user_id, full_name, first_name, middle_name, last_name, employee_id, department, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, constructedFullName, first_name || '', middle_name || '', last_name || '', employee_id || '', department || '', contact_number || '']
      );
    } else if (role === 'student') {
      await pool.query(
        'INSERT INTO students (user_id, student_number, full_name, first_name, middle_name, last_name, gender, course, year_level, contact_number, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, student_number || `SN-${Date.now()}`, constructedFullName, first_name || '', middle_name || '', last_name || '', gender || '', course || '', year_level || '', contact_number || '', address || '']
      );
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
