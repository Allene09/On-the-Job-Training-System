const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Ojt_Db',
    password: process.env.DB_PASS || 'Ojt_Db',
    database: process.env.DB_NAME || 'ojt',
  });

  try {
    console.log('No default seed data is inserted by this script.');
  } catch (err) {
    console.error('❌ Error running seed script:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
