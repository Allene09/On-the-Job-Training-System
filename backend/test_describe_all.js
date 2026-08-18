const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ojt',
  });
  try {
    const [users] = await pool.query('DESCRIBE users;');
    console.log('--- USERS ---');
    console.log(users.map(c => c.Field));

    const [staff] = await pool.query('DESCRIBE staff;');
    console.log('--- STAFF ---');
    console.log(staff.map(c => c.Field));

    const [admins] = await pool.query('DESCRIBE admins;');
    console.log('--- ADMINS ---');
    console.log(admins.map(c => c.Field));

    const [students] = await pool.query('DESCRIBE students;');
    console.log('--- STUDENTS ---');
    console.log(students.map(c => c.Field));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}
checkTables();
