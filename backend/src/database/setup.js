const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Note: Ensure you are running this with the correct environment variables
async function setupDatabase() {
  console.log('Connecting to database...');
  const schemaConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Ojt_Db',
    password: process.env.DB_PASS || 'Ojt_Db',
    database: process.env.DB_NAME || 'ojt',
    multipleStatements: true
  });
  let procedureConnection = null;

  try {
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Executing schema.sql...');
    try {
      await schemaConnection.query(schemaSql);
      console.log('Schema created successfully.');
    } catch (e) {
      console.log('Schema execution skipped or failed (might already exist): ' + e.message);
    }

    console.log('Reading procedures.sql...');
    const proceduresSql = fs.readFileSync(path.join(__dirname, 'procedures.sql'), 'utf8');

    const procedureBlocks = [...proceduresSql.matchAll(/CREATE PROCEDURE[\s\S]*?END\$\$/gi)].map(match =>
      match[0].replace(/\$\$\s*$/, '').trim()
    );

    procedureConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'Ojt_Db',
      password: process.env.DB_PASS || 'Ojt_Db',
      database: process.env.DB_NAME || 'ojt',
      multipleStatements: false
    });
    
    console.log('Executing procedures.sql...');
    for (const stmt of procedureBlocks) {
      await procedureConnection.query(stmt);
    }
    console.log('Procedures created successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (procedureConnection) {
      await procedureConnection.end();
    }
    await schemaConnection.end();
  }
}

setupDatabase();
