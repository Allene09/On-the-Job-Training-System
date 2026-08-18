const { pool } = require('../config/db');

class AuthModel {
  static async searchUsers(search = '') {
    const [userRows] = await pool.query('CALL sp_SearchUsers(?)', [search || '']);
    return userRows[0];
  }

  static async getUserDetails(userId) {
    const [detailsRows] = await pool.query('CALL sp_GetUserDetails(?)', [userId]);
    return detailsRows[0][0] || null;
  }

  static async getUserByEmail(email) {
    const [existingRows] = await pool.query('CALL sp_GetUserByEmail(?)', [email]);
    return existingRows[0];
  }

  static async getUserById(userId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return rows[0] || null;
  }

  static async registerStudent(data) {
    const { email, hashedPassword, plainPassword, student_number, full_name, first_name, middle_name, last_name, course, resolvedYearLevel, gender, contact_number, address, status } = data;
    await pool.query(
      'CALL sp_RegisterStudent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        email,
        hashedPassword,
        plainPassword || null,
        student_number,
        first_name || '',
        middle_name || '',
        last_name || '',
        full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ') || '',
        course || '',
        resolvedYearLevel || '',
        gender || '',
        contact_number || '',
        address || '',
        status || 'pending_admin_approval'
      ]
    );
  }

  static async changeUserPassword(userId, hashedPassword, plainPassword = '') {
    const [result] = await pool.query(
      'CALL sp_ChangeUserPassword(?, ?, ?)',
      [userId, hashedPassword, plainPassword]
    );
    return result;
  }

  static async updateUserProfile(data) {
    const {
      user_id,
      role,
      email,
      hashedPassword,
      plainPassword,
      full_name,
      first_name,
      middle_name,
      last_name,
      student_number,
      course,
      year_level,
      gender,
      employee_id,
      department,
      contact_number,
      address
    } = data;

    const resolvedFullName = full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ') || '';

    await pool.query(
      'CALL sp_UpdateUserProfile(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        role,
        email,
        first_name || '',
        middle_name || '',
        last_name || '',
        resolvedFullName,
        hashedPassword || '',
        plainPassword || '',
        contact_number || '',
        department || '',
        address || '',
        student_number || '',
        course || '',
        year_level || '',
        gender || '',
        employee_id || ''
      ]
    );
  }
}

module.exports = AuthModel;
