import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Building2, Clock, BookOpen,
  TrendingUp, Bell, Star, CheckCircle2, XCircle, AlertCircle,
  Plus, Send, ChevronRight, Award, Search, MapPin, Briefcase, Users
} from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    approved: 'badge-approved', accepted: 'badge-accepted', completed: 'badge-completed',
    pending: 'badge-pending', submitted: 'badge-submitted', ongoing: 'badge-ongoing',
    rejected: 'badge-rejected', terminated: 'badge-terminated'
  };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProgressBar({ value, max, label }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="progress-container">
      <div className="progress-label">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-sm fw-600 text-accent">{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>{value} hrs rendered</span>
        <span>{max} hrs required</span>
      </div>
    </div>
  );
}

export default function StudentDashboard({ activePage, setActivePage }) {
  const { currentUser, mockData } = useAuth();
  const [showDTRModal, setShowDTRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dtrForm, setDtrForm] = useState({ date: '', time_in: '08:00', time_out: '17:00' });
  const [reportForm, setReportForm] = useState({ week: '', narrative: '' });
  const [attendance, setAttendance] = useState([...mockData.attendance]);
  const [requirements, setRequirements] = useState([...mockData.student_requirements]);
  const [applications, setApplications] = useState([...mockData.applications]);
  const [reports, setReports] = useState([...mockData.weekly_reports]);

  const student = mockData.students[0];
  const placement = mockData.ojt_placements[0];
  const company = mockData.companies.find(c => c.company_id === placement?.company_id);
  const notifications = mockData.notifications.filter(n => n.user_id === currentUser.user_id);
  const unreadNotifs = notifications.filter(n => !n.is_read);

  // Build requirement checklist
  const reqChecklist = mockData.requirement_types.map(rt => {
    const sub = requirements.find(sr => sr.student_id === student.student_id && sr.requirement_id === rt.requirement_id);
    return { ...rt, submission: sub || null };
  });

  // Total hours from attendance for this student
  const totalHours = attendance
    .filter(a => a.placement_id === placement?.placement_id)
    .reduce((sum, a) => sum + (a.hours_rendered || 0), 0);
  const hoursRendered = parseFloat(totalHours.toFixed(2));

  const logDTR = () => {
    if (!dtrForm.date || !dtrForm.time_in || !dtrForm.time_out) return;
    const inMins = dtrForm.time_in.split(':').map(Number).reduce((h, m, i) => i === 0 ? h + m * 60 : h + m, 0);
    const outMins = dtrForm.time_out.split(':').map(Number).reduce((h, m, i) => i === 0 ? h + m * 60 : h + m, 0);
    const hrs = parseFloat(((outMins - inMins) / 60).toFixed(2));
    const newRecord = {
      attendance_id: attendance.length + 1,
      placement_id: placement.placement_id,
      log_date: dtrForm.date,
      time_in: dtrForm.time_in,
      time_out: dtrForm.time_out,
      hours_rendered: hrs,
      status: 'present',
      remarks: 'DTR logged'
    };
    setAttendance([...attendance, newRecord]);
    setShowDTRModal(false);
    setDtrForm({ date: '', time_in: '08:00', time_out: '17:00' });
  };

  const submitReport = () => {
    if (!reportForm.week || !reportForm.narrative) return;
    const newRpt = {
      report_id: reports.length + 1,
      placement_id: placement.placement_id,
      week_number: parseInt(reportForm.week),
      narrative: reportForm.narrative,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      reviewed_by: null
    };
    setReports([...reports, newRpt]);
    setShowReportModal(false);
    setReportForm({ week: '', narrative: '' });
  };

  const applyCompany = (company_id) => {
    const exists = applications.find(a => a.student_id === student.student_id && a.company_id === company_id);
    if (exists) return;
    setApplications([...applications, {
      application_id: applications.length + 1,
      student_id: student.student_id,
      company_id,
      status: 'pending',
      applied_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null
    }]);
  };

  const submitRequirement = (req_id) => {
    const exists = requirements.find(r => r.student_id === student.student_id && r.requirement_id === req_id);
    if (exists) return;
    setRequirements([...requirements, {
      submission_id: requirements.length + 1,
      student_id: student.student_id,
      requirement_id: req_id,
      file_path: `/uploads/doc_${Date.now()}.pdf`,
      status: 'pending',
      remarks: null,
      reviewed_by: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null
    }]);
  };

  const pages = {
    dashboard: <DashboardView student={student} placement={placement} company={company} hoursRendered={hoursRendered} notifications={notifications} unreadNotifs={unreadNotifs} evaluations={mockData.evaluations} announcements={mockData.announcements} />,
    profile: <ProfileView student={student} currentUser={currentUser} />,
    requirements: <RequirementsView reqChecklist={reqChecklist} onSubmit={submitRequirement} />,
    companies: <CompaniesView companies={mockData.companies} applications={applications} onApply={applyCompany} student={student} />,
    attendance: <AttendanceView attendance={attendance.filter(a => a.placement_id === placement?.placement_id)} hoursRendered={hoursRendered} required={student.required_hours} onAddDTR={() => setShowDTRModal(true)} />,
    reports: <ReportsView reports={reports} onAdd={() => setShowReportModal(true)} />,
    progress: <ProgressView placement={placement} hoursRendered={hoursRendered} evaluations={mockData.evaluations} company={company} />
  };

  return (
    <>
      {/* DTR Modal */}
      {showDTRModal && (
        <div className="modal-overlay" onClick={() => setShowDTRModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Log Daily Time Record</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDTRModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={dtrForm.date} onChange={e => setDtrForm({ ...dtrForm, date: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Time In</label>
                <input type="time" className="form-input" value={dtrForm.time_in} onChange={e => setDtrForm({ ...dtrForm, time_in: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Time Out</label>
                <input type="time" className="form-input" value={dtrForm.time_out} onChange={e => setDtrForm({ ...dtrForm, time_out: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={logDTR}>
              <Send size={16} /> Save DTR Record
            </button>
          </div>
        </div>
      )}

      {/* Weekly Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Submit Weekly Narrative Report</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Week Number</label>
              <input type="number" className="form-input" placeholder="e.g. 2" min="1" value={reportForm.week} onChange={e => setReportForm({ ...reportForm, week: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Narrative / Summary of Activities</label>
              <textarea className="form-textarea" placeholder="Describe your tasks and learnings for this week..." value={reportForm.narrative} onChange={e => setReportForm({ ...reportForm, narrative: e.target.value })} style={{ minHeight: '120px' }} />
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={submitReport}>
              <Send size={16} /> Submit Report
            </button>
          </div>
        </div>
      )}

      <div className="page">
        {pages[activePage] || pages.dashboard}
      </div>
    </>
  );
}

// --- Sub-views ---

function DashboardView({ student, placement, company, hoursRendered, notifications, unreadNotifs, evaluations, announcements }) {
  const latestEval = evaluations[evaluations.length - 1];
  const progress = placement ? Math.min(Math.round((hoursRendered / student.required_hours) * 100), 100) : 0;

  return (
    <>
      <div className="page-header">
        <h1>Welcome back, {student.full_name.split(' ')[0]} 👋</h1>
        <p>{student.course} · {student.year_level} · {student.student_number}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card cyan animate-fade-in-up delay-100">
          <div className="stat-icon cyan"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-value">{hoursRendered}h</div>
            <div className="stat-label">Hours Rendered</div>
          </div>
        </div>
        <div className="stat-card purple animate-fade-in-up delay-200">
          <div className="stat-icon purple"><Clock size={20} /></div>
          <div>
            <div className="stat-value">{student.required_hours - hoursRendered > 0 ? (student.required_hours - hoursRendered).toFixed(1) : 0}h</div>
            <div className="stat-label">Hours Remaining</div>
          </div>
        </div>
        <div className="stat-card green animate-fade-in-up delay-300">
          <div className="stat-icon green"><Award size={20} /></div>
          <div>
            <div className="stat-value">{latestEval ? `${latestEval.total_score}%` : 'N/A'}</div>
            <div className="stat-label">Latest Score</div>
          </div>
        </div>
        <div className="stat-card orange animate-fade-in-up delay-400">
          <div className="stat-icon orange"><Bell size={20} /></div>
          <div>
            <div className="stat-value">{unreadNotifs.length}</div>
            <div className="stat-label">Notifications</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">OJT Progress</div>
              <div className="card-subtitle">{company?.company_name || 'No placement yet'}</div>
            </div>
            <span className={`badge ${placement?.status === 'ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
              <span className="badge-dot" /> {placement?.status || 'N/A'}
            </span>
          </div>
          {placement ? (
            <>
              <ProgressBar value={hoursRendered} max={student.required_hours} label="OJT Hours Completion" />
              <div className="divider" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date</div>{placement.start_date}</div>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>End Date</div>{placement.end_date}</div>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Company</div>{company?.company_name}</div>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Industry</div>{company?.industry}</div>
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No active placement found.</p></div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Announcements</div>
          </div>
          {announcements.map(a => (
            <div key={a.announcement_id} className="announcement-card">
              <div className="announcement-title">{a.title}</div>
              <div className="announcement-content">{a.content}</div>
              <div className="announcement-date">{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <div className="card-title">Notifications</div>
          {unreadNotifs.length > 0 && <span className="badge badge-pending">{unreadNotifs.length} new</span>}
        </div>
        {notifications.length === 0 ? (
          <div className="empty-state"><p>No notifications yet.</p></div>
        ) : (
          notifications.map(n => (
            <div key={n.notification_id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
              <div style={{ marginTop: '2px', color: n.type === 'approval' ? 'var(--status-approved)' : n.type === 'rejection' ? 'var(--status-rejected)' : 'var(--text-accent)' }}>
                {n.type === 'approval' ? <CheckCircle2 size={16} /> : n.type === 'rejection' ? <XCircle size={16} /> : <Bell size={16} />}
              </div>
              <div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function RequirementsView({ reqChecklist, onSubmit }) {
  const approved = reqChecklist.filter(r => r.submission?.status === 'approved').length;
  const total = reqChecklist.length;

  return (
    <>
      <div className="page-header">
        <h1>Requirements Checklist</h1>
        <p>Submit and track your pre-OJT document requirements</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <ProgressBar value={approved} max={total} label="Documents Approved" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Document Submissions</div>
          <span className="text-sm text-muted">{approved} / {total} approved</span>
        </div>
        {reqChecklist.map(req => {
          const sub = req.submission;
          const statusColor = !sub ? 'var(--text-muted)' : sub.status === 'approved' ? 'var(--status-approved)' : sub.status === 'rejected' ? 'var(--status-rejected)' : 'var(--status-pending)';
          const Icon = !sub ? AlertCircle : sub.status === 'approved' ? CheckCircle2 : sub.status === 'rejected' ? XCircle : AlertCircle;

          return (
            <div key={req.requirement_id} className="req-item">
              <div className="req-icon" style={{ background: `${statusColor}1a` }}>
                <Icon size={18} color={statusColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="req-name">{req.name}</div>
                <div className="req-deadline">Deadline: {req.deadline} {!req.is_required && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(Optional)</span>}</div>
                {sub?.remarks && <div className="req-deadline" style={{ color: 'var(--text-secondary)' }}>Remarks: {sub.remarks}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sub ? <StatusBadge status={sub.status} /> : (
                  <button className="btn btn-primary btn-sm" onClick={() => onSubmit(req.requirement_id)}>
                    <Plus size={13} /> Submit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CompaniesView({ companies, applications, onApply, student }) {
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1>Partner Companies</h1>
        <p>Browse and apply to available Host Training Establishments (HTEs)</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search company, industry, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
            borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}>✕</button>
        )}
      </div>

      {search && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="card empty-state"><p>No companies match your search.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(c => {
            const isFull = c.slots_available === 0;
            const app = applications.find(a => a.student_id === student.student_id && a.company_id === c.company_id);
            return (
              <div key={c.company_id} className="company-card" style={{ opacity: isFull ? 0.72 : 1, position: 'relative' }}>

                {/* Full badge overlay */}
                {isFull && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Full
                  </div>
                )}

                {/* Company Photo */}
                <div style={{ height: '120px', borderRadius: '12px 12px 0 0', background: `url(${c.photo_url || '/company1.png'}) center/cover no-repeat`, marginBottom: '12px', marginTop: '-16px', marginLeft: '-16px', paddingRight: '32px', width: 'calc(100% + 32px)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div className="company-name">{c.company_name}</div>
                    {/* Slots counter */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      marginTop: '3px', fontSize: '0.75rem', fontWeight: 600,
                      color: isFull ? '#f43f5e' : '#38bdf8'
                    }}>
                      <Users size={12} />
                      {isFull
                        ? 'No slots — Full'
                        : `${c.slots_available} slot${c.slots_available !== 1 ? 's' : ''} needed`
                      }
                    </div>
                  </div>
                </div>

                <div className="company-meta">
                  <span className="company-tag"><Briefcase size={11} style={{ marginRight: 3 }} />{c.industry}</span>
                  <span className="company-tag"><MapPin size={11} style={{ marginRight: 3 }} />{c.address}</span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div>Contact: <span style={{ color: 'var(--text-secondary)' }}>{c.contact_person}</span></div>
                  <div>Email: <span style={{ color: 'var(--text-accent)' }}>{c.email}</span></div>
                  {c.requirements && (
                    <div style={{ marginTop: '4px' }}>Requirements: <span style={{ color: 'var(--text-secondary)' }}>{c.requirements}</span></div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <StatusBadge status={c.status} />
                  {app ? (
                    <StatusBadge status={app.status} />
                  ) : isFull ? (
                    <button
                      disabled
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600,
                        background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
                        color: 'var(--text-muted)', cursor: 'not-allowed'
                      }}
                    >
                      <AlertCircle size={12} /> Not Available
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => onApply(c.company_id)}>
                      Apply <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function AttendanceView({ attendance, hoursRendered, required, onAddDTR }) {
  const sorted = [...attendance].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Daily Time Record (DTR)</h1>
            <p>Log and track your daily attendance and hours</p>
          </div>
          <button className="btn btn-primary" onClick={onAddDTR}><Plus size={16} /> Log DTR</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <ProgressBar value={hoursRendered} max={required} label="Total Hours Rendered" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Attendance Log</div>
          <span className="text-sm text-muted">{attendance.length} entries</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(a => (
                <tr key={a.attendance_id}>
                  <td>{a.log_date}</td>
                  <td>{a.time_in}</td>
                  <td>{a.time_out}</td>
                  <td style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{a.hours_rendered}h</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ReportsView({ reports, onAdd }) {
  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Weekly Narrative Reports</h1>
            <p>Submit your weekly OJT activity summaries</p>
          </div>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> New Report</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reports.length === 0 ? (
          <div className="card empty-state"><p>No reports submitted yet.</p></div>
        ) : (
          reports.map(r => (
            <div key={r.report_id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Week {r.week_number} Report</div>
                  <div className="card-subtitle">Submitted: {new Date(r.submitted_at).toLocaleDateString()}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{r.narrative}</p>
              {r.reviewed_by && (
                <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--status-approved)' }}>
                  ✓ Reviewed by coordinator
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

function ProgressView({ placement, hoursRendered, evaluations, company }) {
  const latest = evaluations[evaluations.length - 1];
  const maxScore = 100;

  return (
    <>
      <div className="page-header">
        <h1>OJT Progress & Evaluation</h1>
        <p>Track your training completion and performance scores</p>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Hours Progress</div>
            <StatusBadge status={placement?.status || 'ongoing'} />
          </div>
          {placement ? (
            <ProgressBar value={hoursRendered} max={placement.required_hours} label="Completion" />
          ) : (
            <div className="empty-state"><p>No active placement.</p></div>
          )}
          {company && (
            <>
              <div className="divider" />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '4px' }}>🏢 <span style={{ color: 'var(--text-primary)' }}>{company.company_name}</span></div>
                <div>📅 {placement?.start_date} → {placement?.end_date}</div>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Latest Evaluation</div>
            {latest && <span style={{ fontSize: '1.3rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{latest.total_score}%</span>}
          </div>
          {latest ? (
            <>
              <div className="score-bar">
                <div className="score-label">Attendance</div>
                <div className="score-track"><div className="score-fill" style={{ width: `${latest.attendance_score}%` }} /></div>
                <div className="score-value">{latest.attendance_score}</div>
              </div>
              <div className="score-bar">
                <div className="score-label">Work Quality</div>
                <div className="score-track"><div className="score-fill" style={{ width: `${latest.work_quality_score / 35 * 100}%` }} /></div>
                <div className="score-value">{latest.work_quality_score}</div>
              </div>
              <div className="score-bar">
                <div className="score-label">Attitude</div>
                <div className="score-track"><div className="score-fill" style={{ width: `${latest.attitude_score}%` }} /></div>
                <div className="score-value">{latest.attitude_score}</div>
              </div>
              <div className="divider" />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>Evaluator: <span style={{ color: 'var(--text-secondary)' }}>{latest.evaluator_name}</span></div>
                {latest.remarks && <div style={{ marginTop: '6px', fontStyle: 'italic', color: 'var(--status-approved)' }}>"{latest.remarks}"</div>}
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No evaluation submitted yet.</p></div>
          )}
        </div>
      </div>
    </>
  );
}

function ProfileView({ student, currentUser }) {
  const [formData, setFormData] = useState({
    first_name: student.full_name ? student.full_name.split(' ')[0] : '',
    last_name: student.full_name ? student.full_name.split(' ').slice(1).join(' ') : '',
    course: student.course || '',
    year_section: student.year_level || '',
    gender: student.gender || '',
    email: currentUser.email || '',
    password: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSave = (e) => {
    e.preventDefault();
    // Since we are just using a static mock database on the frontend,
    // we'd normally call an API here. For now, just show a success message.
    setMsg({ type: 'success', text: 'Profile updated successfully!' });
  };

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <div className="card-title">Edit Profile</div>
        </div>

        {msg.text && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem', background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.type === 'success' ? 'var(--status-approved)' : 'var(--status-rejected)' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course</label>
            <input type="text" className="form-input" required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Year and Section</label>
            <input type="text" className="form-input" required value={formData.year_section} onChange={e => setFormData({...formData, year_section: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-input" required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="divider" style={{ margin: '24px 0' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Account Settings</h3>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Change Password</label>
            <input type="password" className="form-input" placeholder="Leave blank to keep current password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </>
  );
}
