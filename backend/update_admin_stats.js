const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ojt',
    multipleStatements: true
  });
  
  await connection.query('DROP PROCEDURE IF EXISTS sp_GetAdminDashboardStats');
  
  const sql = `
CREATE PROCEDURE sp_GetAdminDashboardStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'completed') AS completed_placements,
        (SELECT COUNT(*) FROM ojt_placements WHERE status = 'ongoing') AS ongoing_placements,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM staff) AS total_staff,
        (SELECT COUNT(*) FROM companies) AS total_companies,
        (SELECT COUNT(*) FROM companies WHERE status = 'active') AS active_companies,
        (SELECT SUM(hours_rendered) FROM attendance) AS total_hours_rendered;
END
  `;
  
  await connection.query(sql);
  await connection.end();
  console.log('Done updating sp_GetAdminDashboardStats');
}

run();
