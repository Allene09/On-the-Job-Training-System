require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyRoutes = require('./routes/companyRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../../frontend/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/evaluations', evaluationRoutes);

const os = require('os');
const { pool } = require('./config/db');

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 MB';
  const mb = (bytes / (1024 * 1024)).toFixed(2);
  return `${mb} MB`;
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

async function getServerDiagnostics() {
  const startTime = Date.now();
  let dbStatus = 'Disconnected';
  let dbPingMs = null;
  let dbVersion = 'MySQL';
  let stats = {
    totalUsers: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalAdmins: 0,
    totalCompanies: 0,
    totalPlacements: 0,
    pendingRequirements: 0
  };

  try {
    const pingStart = Date.now();
    const [verRows] = await pool.query('SELECT VERSION() as version');
    dbPingMs = Date.now() - pingStart;
    dbStatus = 'Connected';
    dbVersion = verRows[0]?.version || 'MySQL 8.0';

    const [userCount] = await pool.query('SELECT COUNT(*) as c FROM users');
    const [studentCount] = await pool.query('SELECT COUNT(*) as c FROM students');
    const [staffCount] = await pool.query('SELECT COUNT(*) as c FROM staff');
    const [adminCount] = await pool.query('SELECT COUNT(*) as c FROM admins');
    const [companyCount] = await pool.query('SELECT COUNT(*) as c FROM companies');
    const [placementCount] = await pool.query('SELECT COUNT(*) as c FROM ojt_placements');
    const [reqCount] = await pool.query("SELECT COUNT(*) as c FROM student_requirements WHERE status = 'pending'");

    stats = {
      totalUsers: userCount[0]?.c || 0,
      totalStudents: studentCount[0]?.c || 0,
      totalStaff: staffCount[0]?.c || 0,
      totalAdmins: adminCount[0]?.c || 0,
      totalCompanies: companyCount[0]?.c || 0,
      totalPlacements: placementCount[0]?.c || 0,
      pendingRequirements: reqCount[0]?.c || 0
    };
  } catch (err) {
    dbStatus = `Error: ${err.message}`;
  }

  const mem = process.memoryUsage();
  return {
    server: {
      name: "OJTrack Backend Service",
      description: "On-the-Job Training Management System REST API",
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 5000,
      nodeVersion: process.version,
      platform: `${os.type()} ${os.release()} (${os.arch()})`,
      pid: process.pid,
      uptimeFormatted: formatUptime(process.uptime()),
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rss: formatBytes(mem.rss),
        heapUsed: formatBytes(mem.heapUsed),
        heapTotal: formatBytes(mem.heapTotal),
        external: formatBytes(mem.external)
      },
      system: {
        cpuModel: os.cpus()[0]?.model || 'Standard CPU',
        cpuCores: os.cpus().length,
        totalMemory: formatBytes(os.totalmem()),
        freeMemory: formatBytes(os.freemem())
      }
    },
    database: {
      status: dbStatus,
      engine: dbVersion,
      database: process.env.DB_NAME || 'ojt',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      latency: dbPingMs !== null ? `${dbPingMs} ms` : 'N/A',
      metrics: stats
    },
    timestamp: new Date().toISOString(),
    apiLatencyMs: Date.now() - startTime
  };
}

// API Root & Health Handlers
const renderApiIndex = async (req, res) => {
  const diagnostics = await getServerDiagnostics();
  const acceptsHtml = req.accepts('html', 'json') === 'html';
  
  if (!acceptsHtml) {
    return res.json({
      success: true,
      ...diagnostics,
      endpoints: {
        health: "/api/health",
        auth: {
          login: "POST /api/auth/login",
          register: "POST /api/auth/register",
          profile: "GET /api/auth/profile",
          updateProfile: "PUT /api/auth/profile",
          changePassword: "POST /api/auth/change-password"
        },
        student: {
          dashboard: "GET /api/student/dashboard",
          requirements: "GET /api/student/requirements",
          submitRequirement: "POST /api/student/requirements/:id",
          placements: "GET /api/student/placements",
          applyCompany: "POST /api/student/apply",
          weeklyReports: "GET /api/student/reports/weekly",
          submitReport: "POST /api/student/reports/weekly"
        },
        staff: {
          dashboard: "GET /api/staff/dashboard",
          students: "GET /api/staff/students",
          requirements: "GET /api/staff/requirements/pending",
          reviewRequirement: "POST /api/staff/requirements/review",
          applications: "GET /api/staff/applications",
          evaluations: "GET /api/staff/evaluations",
          submitEvaluation: "POST /api/staff/evaluations"
        },
        admin: {
          dashboard: "GET /api/admin/dashboard",
          users: "GET /api/admin/users",
          createUser: "POST /api/admin/users",
          pendingAccounts: "GET /api/admin/accounts/pending",
          approveAccount: "POST /api/admin/accounts/:id/approve",
          rejectAccount: "POST /api/admin/accounts/:id/reject",
          monthlyReport: "GET /api/admin/reports/monthly"
        },
        companies: {
          list: "GET /api/companies",
          create: "POST /api/companies",
          update: "PUT /api/companies/:id",
          delete: "DELETE /api/companies/:id"
        },
        requirements: "GET /api/requirements",
        attendance: "GET /api/attendance",
        evaluations: "GET /api/evaluations"
      }
    });
  }

  const { server, database, timestamp } = diagnostics;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OJTrack Backend Server Telemetry & API Console</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg-color: #080c14;
        --card-bg: rgba(18, 26, 43, 0.75);
        --card-border: rgba(255, 255, 255, 0.08);
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --accent-blue: #38bdf8;
        --accent-cyan: #06b6d4;
        --accent-purple: #a855f7;
        --status-green: #10b981;
        --code-bg: rgba(11, 17, 30, 0.9);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background-color: var(--bg-color);
        background-image: 
          radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.12) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 60%);
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text-primary);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }
      .container {
        width: 100%;
        max-width: 980px;
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--card-border);
        padding-bottom: 28px;
        margin-bottom: 32px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .logo-group {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .logo-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: linear-gradient(135deg, #38bdf8, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.4rem;
        color: white;
        box-shadow: 0 6px 20px rgba(56, 189, 248, 0.35);
      }
      .title {
        font-size: 1.55rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        background: linear-gradient(to right, #ffffff, #cbd5e1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .subtitle {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 3px;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--status-green);
        padding: 8px 16px;
        border-radius: 9999px;
        font-size: 0.84rem;
        font-weight: 700;
      }
      .status-dot {
        width: 9px;
        height: 9px;
        background: var(--status-green);
        border-radius: 50%;
        box-shadow: 0 0 12px var(--status-green);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.35; transform: scale(0.85); }
      }
      .btn-ping {
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #38bdf8;
        padding: 8px 16px;
        border-radius: 9999px;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .btn-ping:hover {
        background: rgba(56, 189, 248, 0.22);
        transform: translateY(-1px);
      }
      .section-heading {
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin: 28px 0 14px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-heading::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--card-border);
      }
      .grid-6 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 14px;
      }
      .grid-4 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 14px;
      }
      .card-metric {
        background: rgba(14, 21, 37, 0.65);
        border: 1px solid var(--card-border);
        border-radius: 14px;
        padding: 16px 18px;
        transition: all 0.2s ease;
      }
      .card-metric:hover {
        border-color: rgba(56, 189, 248, 0.25);
        background: rgba(18, 27, 48, 0.8);
      }
      .metric-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary);
        margin-bottom: 6px;
      }
      .metric-value {
        font-size: 1.05rem;
        font-weight: 800;
        color: #f1f5f9;
        font-family: 'JetBrains Mono', monospace;
      }
      .metric-sub {
        font-size: 0.76rem;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .tabs-nav {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .tab-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--card-border);
        color: var(--text-secondary);
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .tab-btn:hover, .tab-btn.active {
        background: rgba(56, 189, 248, 0.15);
        border-color: rgba(56, 189, 248, 0.35);
        color: #38bdf8;
      }
      .endpoints-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .endpoint-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--code-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 12px 18px;
        text-decoration: none;
        transition: all 0.2s ease;
        flex-wrap: wrap;
        gap: 10px;
      }
      .endpoint-row:hover {
        border-color: rgba(56, 189, 248, 0.35);
        background: rgba(22, 33, 56, 0.9);
        transform: translateY(-1px);
      }
      .endpoint-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .method-tag {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
      }
      .m-get { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); }
      .m-post { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.25); }
      .m-put { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.25); }
      .m-delete { background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.25); }
      .endpoint-path {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.88rem;
        color: #f1f5f9;
        font-weight: 600;
      }
      .endpoint-meta {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .auth-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
      }
      .endpoint-desc {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }
      .live-console {
        background: #060911;
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 16px;
        margin-top: 14px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        color: #94a3b8;
        max-height: 160px;
        overflow-y: auto;
      }
      .footer {
        margin-top: 36px;
        padding-top: 24px;
        border-top: 1px solid var(--card-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--text-muted);
        flex-wrap: wrap;
        gap: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-group">
          <div class="logo-icon">OJ</div>
          <div>
            <div class="title">OJTrack Backend Service</div>
            <div class="subtitle">On-the-Job Training Management REST API Engine</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-ping" onclick="pingServer()">⚡ Test Live Latency</button>
          <div class="status-pill">
            <span class="status-dot"></span>
            <span id="status-text">API Online</span>
          </div>
        </div>
      </div>

      <!-- Section: Telemetry & Host Metrics -->
      <div class="section-heading">Server & Host Diagnostics</div>
      <div class="grid-6">
        <div class="card-metric">
          <div class="metric-label">Server Port & Process</div>
          <div class="metric-value">:${server.port} <span style="font-size:0.75rem; color:var(--text-muted)">(PID ${server.pid})</span></div>
          <div class="metric-sub">${server.environment.toUpperCase()} Mode</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Server Uptime</div>
          <div class="metric-value" style="color: #38bdf8;">${server.uptimeFormatted}</div>
          <div class="metric-sub">${server.uptimeSeconds} seconds running</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Database Health</div>
          <div class="metric-value" style="color: #10b981;">${database.status}</div>
          <div class="metric-sub">${database.database}@${database.host} • ${database.latency}</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Process Memory</div>
          <div class="metric-value">${server.memory.heapUsed}</div>
          <div class="metric-sub">RSS: ${server.memory.rss} • Heap: ${server.memory.heapTotal}</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Runtime Engine</div>
          <div class="metric-value">${server.nodeVersion}</div>
          <div class="metric-sub">${server.platform}</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Host CPU & RAM</div>
          <div class="metric-value">${server.system.cpuCores} Cores</div>
          <div class="metric-sub">Free: ${server.system.freeMemory} / ${server.system.totalMemory}</div>
        </div>
      </div>

      <!-- Section: Live Database Entity Counters -->
      <div class="section-heading">Live Database Statistics</div>
      <div class="grid-4">
        <div class="card-metric">
          <div class="metric-label">Total Accounts</div>
          <div class="metric-value" style="color:#a855f7;">${database.metrics.totalUsers}</div>
          <div class="metric-sub">${database.metrics.totalStudents} Students • ${database.metrics.totalStaff} Staff • ${database.metrics.totalAdmins} Admin</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Partner Companies</div>
          <div class="metric-value" style="color:#38bdf8;">${database.metrics.totalCompanies}</div>
          <div class="metric-sub">Active Host Training Establishments</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Active Placements</div>
          <div class="metric-value" style="color:#10b981;">${database.metrics.totalPlacements}</div>
          <div class="metric-sub">Students currently deployed</div>
        </div>
        <div class="card-metric">
          <div class="metric-label">Pending Reviews</div>
          <div class="metric-value" style="color:#fbbf24;">${database.metrics.pendingRequirements}</div>
          <div class="metric-sub">Submissions awaiting coordinator check</div>
        </div>
      </div>

      <!-- Section: Endpoint Explorer with Tabs -->
      <div class="section-heading">API Route Explorer & Directory</div>
      <div class="tabs-nav">
        <button class="tab-btn active" onclick="filterRoutes('all', this)">All Endpoints</button>
        <button class="tab-btn" onclick="filterRoutes('auth', this)">Auth & Users</button>
        <button class="tab-btn" onclick="filterRoutes('student', this)">Student Portal</button>
        <button class="tab-btn" onclick="filterRoutes('staff', this)">Staff Portal</button>
        <button class="tab-btn" onclick="filterRoutes('admin', this)">Admin Portal</button>
        <button class="tab-btn" onclick="filterRoutes('companies', this)">Companies & System</button>
      </div>

      <div class="endpoints-container" id="endpoints-list">
        <a href="/api/health" class="endpoint-row" data-cat="companies">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/health</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Live health check & database ping</span>
            <span class="auth-badge">Public</span>
          </div>
        </a>

        <div class="endpoint-row" data-cat="auth">
          <div class="endpoint-left">
            <span class="method-tag m-post">POST</span>
            <span class="endpoint-path">/api/auth/login</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">User authentication & JWT generation</span>
            <span class="auth-badge">Public</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="auth">
          <div class="endpoint-left">
            <span class="method-tag m-post">POST</span>
            <span class="endpoint-path">/api/auth/register</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Student self-registration portal</span>
            <span class="auth-badge">Public</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="auth">
          <div class="endpoint-left">
            <span class="method-tag m-put">PUT</span>
            <span class="endpoint-path">/api/auth/profile</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Update profile details & password</span>
            <span class="auth-badge">JWT Bearer</span>
          </div>
        </div>

        <a href="/api/companies" class="endpoint-row" data-cat="companies">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/companies</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">List verified partner companies</span>
            <span class="auth-badge">Public</span>
          </div>
        </a>

        <a href="/api/requirements" class="endpoint-row" data-cat="companies">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/requirements</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">List master requirement document types</span>
            <span class="auth-badge">Public</span>
          </div>
        </a>

        <div class="endpoint-row" data-cat="student">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/student/dashboard</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Trainee OJT dashboard stats & progress</span>
            <span class="auth-badge">Student</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="student">
          <div class="endpoint-left">
            <span class="method-tag m-post">POST</span>
            <span class="endpoint-path">/api/student/requirements/:id</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Upload requirement PDF/image file</span>
            <span class="auth-badge">Student</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="staff">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/staff/dashboard</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Coordinator metrics & trainee overviews</span>
            <span class="auth-badge">Staff</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="staff">
          <div class="endpoint-left">
            <span class="method-tag m-post">POST</span>
            <span class="endpoint-path">/api/staff/evaluations</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Submit performance evaluation scoring</span>
            <span class="auth-badge">Staff</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="admin">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/admin/dashboard</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Administrator overview & system analytics</span>
            <span class="auth-badge">Admin</span>
          </div>
        </div>

        <div class="endpoint-row" data-cat="admin">
          <div class="endpoint-left">
            <span class="method-tag m-get">GET</span>
            <span class="endpoint-path">/api/admin/users</span>
          </div>
          <div class="endpoint-meta">
            <span class="endpoint-desc">Manage accounts across all university roles</span>
            <span class="auth-badge">Admin</span>
          </div>
        </div>
      </div>

      <!-- Live Console Response Box -->
      <div class="live-console" id="live-console">
        <span style="color: #38bdf8;">[Console Ready]</span> Click "Test Live Latency" above to ping /api/health and view server response time.
      </div>

      <div class="footer">
        <div>
          <strong>Bohol Island State University</strong> — On-the-Job Training System
        </div>
        <div>
          <span>Server Diagnostics Engine • Version 1.0.0</span>
        </div>
      </div>
    </div>

    <script>
      function filterRoutes(category, btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const rows = document.querySelectorAll('.endpoint-row');
        rows.forEach(r => {
          if (category === 'all' || r.getAttribute('data-cat') === category) {
            r.style.display = 'flex';
          } else {
            r.style.display = 'none';
          }
        });
      }

      async function pingServer() {
        const consoleEl = document.getElementById('live-console');
        const start = performance.now();
        consoleEl.innerHTML = '<span style="color:#fbbf24;">[Ping Dispatch]</span> Sending GET request to /api/health...';
        
        try {
          const res = await fetch('/api/health');
          const elapsed = (performance.now() - start).toFixed(1);
          const data = await res.json();
          consoleEl.innerHTML = 
            '<span style="color:#10b981;">[200 OK - ' + elapsed + 'ms]</span> /api/health response:<br>' +
            '<pre style="margin-top:6px; color:#e2e8f0;">' + JSON.stringify(data, null, 2) + '</pre>';
        } catch (err) {
          consoleEl.innerHTML = '<span style="color:#f43f5e;">[Error]</span> Failed to ping /api/health: ' + err.message;
        }
      }
    </script>
  </body>
  </html>
  `;
  res.send(html);
};

app.get('/', renderApiIndex);
app.get('/api', renderApiIndex);

app.get('/api/health', async (req, res) => {
  const pingStart = Date.now();
  let dbOk = false;
  try {
    await pool.query('SELECT 1');
    dbOk = true;
  } catch (e) {
    dbOk = false;
  }

  res.json({
    status: "OK",
    system: "OJTrack Backend Service",
    mode: "MySQL Database Connected",
    database: {
      connected: dbOk,
      latency: `${Date.now() - pingStart} ms`,
      name: process.env.DB_NAME || 'ojt'
    },
    uptime: formatUptime(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Fallback 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
    available_routes: "/api"
  });
});

module.exports = app;


