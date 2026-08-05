const { pool } = require('../config/db');

class AuthModel {
  static async searchUsers(role) {
    const [userRows] = await pool.query('CALL sp_SearchUsers(?, NULL)', [role || '']);
    return userRows[0];
  }

  static async getUserDetails(userId, role) {
    const [detailsRows] = await pool.query('CALL sp_GetUserDetails(?, ?)', [userId, role]);
    return detailsRows[0][0] || null;
  }

  static async getUserByEmail(email) {
    const [existingRows] = await pool.query('CALL sp_GetUserByEmail(?)', [email]);
    return existingRows[0];
  }

  static async registerStudent(data) {
    const { email, hashedPassword, student_number, full_name, first_name, middle_name, last_name, gender, course, resolvedYearLevel } = data;
    await pool.query(
      'CALL sp_RegisterStudent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, student_number, full_name, first_name, middle_name, last_name, gender, course, resolvedYearLevel]
    );
  }

  static async changeUserPassword(userId, hashedPassword) {
    const [result] = await pool.query(
      'CALL sp_ChangeUserPassword(?, ?)',
      [userId, hashedPassword]
    );
    return result;
  }

  static async updateUserProfile(data) {
    const {
      user_id,
      role,
      email,
      hashedPassword,
      full_name,
      student_number,
      course,
      year_level,
      gender,
      employee_id,
      department
    } = data;

    await pool.query(
      'CALL sp_UpdateUserProfile(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        role,
        email,
        hashedPassword,
        full_name || '',
        student_number || '',
        course || '',
        year_level || '',
        gender || '',
        employee_id || '',
        department || ''
      ]
    );
  }
}

module.exports = AuthModel;
