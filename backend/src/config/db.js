const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'Ojt_Db',
  password: process.env.DB_PASS || 'Ojt_Db',
  database: process.env.DB_NAME || 'ojt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  pool
};
