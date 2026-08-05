const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeStudents() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ojt',
  });
  try {
    const [rows] = await pool.query('DESCRIBE students;');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
describeStudents();
