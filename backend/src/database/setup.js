const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Note: Ensure you are running this with the correct environment variables
async function setupDatabase() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Ojt_Db',
    password: process.env.DB_PASS || 'Ojt_Db',
    database: process.env.DB_NAME || 'ojt',
    multipleStatements: true
  });

  try {
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Executing schema.sql...');
    try {
      await connection.query(schemaSql);
      console.log('Schema created successfully.');
    } catch (e) {
      console.log('Schema execution skipped or failed (might already exist): ' + e.message);
    }

    console.log('Reading procedures.sql...');
    let proceduresSql = fs.readFileSync(path.join(__dirname, 'procedures.sql'), 'utf8');
    
    // Remove DELIMITER commands
    proceduresSql = proceduresSql.replace(/DELIMITER \$\$/g, '').replace(/DELIMITER ;/g, '');
    
    // Split by $$ and execute each statement separately
    const statements = proceduresSql.split('$$').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log('Executing procedures.sql...');
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    console.log('Procedures created successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
