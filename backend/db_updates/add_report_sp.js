const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSP() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ojt',
  });

  try {
    console.log('Dropping old SP...');
    await connection.query(`DROP PROCEDURE IF EXISTS sp_GetMonthlyStatisticalReport;`);

    console.log('Creating new SP...');
    await connection.query(`
      CREATE PROCEDURE sp_GetMonthlyStatisticalReport(IN p_year INT)
      BEGIN
          SELECT 
              m.month_num,
              m.month_name,
              COALESCE(u.registrations, 0) AS registrations,
              COALESCE(p.placements, 0) AS placements,
              COALESCE(a.hours_tracked, 0) AS hours_tracked
          FROM (
              SELECT 1 AS month_num, 'Jan' AS month_name UNION SELECT 2, 'Feb' UNION SELECT 3, 'Mar'
              UNION SELECT 4, 'Apr' UNION SELECT 5, 'May' UNION SELECT 6, 'Jun'
              UNION SELECT 7, 'Jul' UNION SELECT 8, 'Aug' UNION SELECT 9, 'Sep'
              UNION SELECT 10, 'Oct' UNION SELECT 11, 'Nov' UNION SELECT 12, 'Dec'
          ) m
          LEFT JOIN (
              SELECT MONTH(created_at) AS month_num, COUNT(*) AS registrations
              FROM users 
              WHERE YEAR(created_at) = p_year AND role IN ('student', 'staff')
              GROUP BY MONTH(created_at)
          ) u ON m.month_num = u.month_num
          LEFT JOIN (
              SELECT MONTH(start_date) AS month_num, COUNT(*) AS placements
              FROM ojt_placements 
              WHERE YEAR(start_date) = p_year 
              GROUP BY MONTH(start_date)
          ) p ON m.month_num = p.month_num
          LEFT JOIN (
              SELECT MONTH(log_date) AS month_num, SUM(hours_rendered) AS hours_tracked
              FROM attendance 
              WHERE YEAR(log_date) = p_year 
              GROUP BY MONTH(log_date)
          ) a ON m.month_num = a.month_num
          ORDER BY m.month_num;
      END
    `);
    console.log('Successfully created sp_GetMonthlyStatisticalReport');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createSP();
