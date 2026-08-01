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
  
  await connection.query('DROP PROCEDURE IF EXISTS sp_GetStaffStudents');
  
  const sql = `
CREATE PROCEDURE sp_GetStaffStudents()
BEGIN
    SELECT s.*, u.email, u.status as account_status,
           p.placement_id as active_placement_id,
           p.status as active_placement_status,
           p.company_id, p.total_hours_rendered, p.required_hours, c.company_name
    FROM students s
    LEFT JOIN users u ON s.user_id = u.user_id
    LEFT JOIN ojt_placements p ON s.student_id = p.student_id AND p.status = 'ongoing'
    LEFT JOIN companies c ON p.company_id = c.company_id;
END
  `;
  
  await connection.query(sql);
  await connection.end();
  console.log('Done updating sp_GetStaffStudents');
}

run();
