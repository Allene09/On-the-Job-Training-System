const fs = require('fs');
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

  const sql = fs.readFileSync('stored_procedures.sql', 'utf8');
  
  const blocks = sql.split('$$');
  for (let block of blocks) {
    block = block.replace(/^DELIMITER.*$/gm, '').trim();
    if (block) {
      console.log('Executing block starting with:', block.substring(0, 50).replace(/\n/g, ' '));
      try {
        await connection.query(block);
      } catch (err) {
        console.error('Error executing block:', err.message);
      }
    }
  }

  await connection.end();
  console.log('Done.');
}

run();
