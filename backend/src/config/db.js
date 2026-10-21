const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'Ojt_Db',
  password: process.env.DB_PASS || 'Ojt_Db',
  database: process.env.DB_NAME || 'ojt',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000
});

// Wrap query and execute with auto-retry on remote connection drops (ECONNRESET, timeout)
const originalQuery = pool.query.bind(pool);
pool.query = async function (...args) {
  try {
    return await originalQuery(...args);
  } catch (err) {
    if (err && (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT' || err.fatal)) {
      console.warn(`[MySQL] Connection reset or lost (${err.code}). Reconnecting and retrying query...`);
      return await originalQuery(...args);
    }
    throw err;
  }
};

const originalExecute = pool.execute.bind(pool);
pool.execute = async function (...args) {
  try {
    return await originalExecute(...args);
  } catch (err) {
    if (err && (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT' || err.fatal)) {
      console.warn(`[MySQL] Connection reset or lost (${err.code}). Reconnecting and retrying execute...`);
      return await originalExecute(...args);
    }
    throw err;
  }
};

// Keep-alive heartbeat every 45s to prevent Hostinger firewall from dropping idle TCP connections
setInterval(async () => {
  try {
    await originalQuery('SELECT 1');
  } catch (err) {
    // Ignore heartbeat errors
  }
}, 45000).unref();

module.exports = {
  pool
};

