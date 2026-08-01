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
  
  await connection.query('DROP PROCEDURE IF EXISTS sp_SubmitWeeklyReport');
  await connection.query('DROP PROCEDURE IF EXISTS sp_GetWeeklyReportsByStudentId');
  
  const sql1 = `
CREATE PROCEDURE sp_SubmitWeeklyReport(IN p_placement_id INT, IN p_week_number INT, IN p_narrative TEXT)
BEGIN
    INSERT INTO weekly_reports (placement_id, week_number, narrative, status)
    VALUES (p_placement_id, p_week_number, p_narrative, 'submitted');
    SELECT LAST_INSERT_ID() AS insertId;
END
  `;
  
  const sql2 = `
CREATE PROCEDURE sp_GetWeeklyReportsByStudentId(IN p_student_id INT)
BEGIN
    SELECT wr.*
    FROM weekly_reports wr
    JOIN ojt_placements p ON wr.placement_id = p.placement_id
    WHERE (p_student_id IS NULL OR p.student_id = p_student_id)
    ORDER BY wr.submitted_at DESC;
END
  `;
  
  await connection.query(sql1);
  await connection.query(sql2);
  await connection.end();
  console.log('Done fixing weekly reports SPs');
}

run();
