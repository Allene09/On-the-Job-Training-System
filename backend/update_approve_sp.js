require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateProcedures() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ojt',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log("Dropping sp_ApproveStudentAccount...");
    await pool.query("DROP PROCEDURE IF EXISTS `sp_ApproveStudentAccount`");

    console.log("Creating sp_ApproveStudentAccount...");
    await pool.query(`
      CREATE PROCEDURE \`sp_ApproveStudentAccount\`(
          IN p_user_id INT,
          IN p_password_hash VARCHAR(255)
      )
      BEGIN
          UPDATE users
          SET status = 'active', password_hash = p_password_hash
          WHERE user_id = p_user_id;
      END
    `);

    console.log("Dropping sp_GetPendingAccounts...");
    await pool.query("DROP PROCEDURE IF EXISTS `sp_GetPendingAccounts`");

    console.log("Creating sp_GetPendingAccounts...");
    await pool.query(`
      CREATE PROCEDURE \`sp_GetPendingAccounts\`()
      BEGIN
          SELECT u.user_id, u.email, u.role, u.status, u.created_at, s.student_number, s.full_name, s.course, s.year_level, s.first_name, s.last_name
          FROM users u
          JOIN students s ON u.user_id = s.user_id
          WHERE u.status = 'pending_admin_approval';
      END
    `);

    console.log("Dropping sp_RejectStudentAccount...");
    await pool.query("DROP PROCEDURE IF EXISTS `sp_RejectStudentAccount`");

    console.log("Creating sp_RejectStudentAccount...");
    await pool.query(`
      CREATE PROCEDURE \`sp_RejectStudentAccount\`(
          IN p_user_id INT
      )
      BEGIN
          UPDATE users
          SET status = 'inactive'
          WHERE user_id = p_user_id;
      END
    `);

    console.log("Stored procedures updated successfully.");
  } catch (err) {
    console.error("Error updating procedures:", err);
  } finally {
    await pool.end();
  }
}

updateProcedures();
