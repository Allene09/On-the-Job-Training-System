import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileCheck, Briefcase, ClipboardList,
  Star, CheckCircle2, XCircle, AlertCircle, Bell, Clock, TrendingUp, Building2
} from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    approved: 'badge-approved', accepted: 'badge-accepted', completed: 'badge-completed',
    active: 'badge-active', pending: 'badge-pending', submitted: 'badge-submitted',
    ongoing: 'badge-ongoing', rejected: 'badge-rejected', reviewed: 'badge-approved'
  };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function StaffDashboard({ activePage }) {
  const { mockData } = useAuth();
  const [submissions, setSubmissions] = useState([...mockData.student_requirements]);
  const [applications, setApplications] = useState([...mockData.applications]);
  const [evaluations, setEvaluations] = useState([...mockData.evaluations]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({ placement_id: 1, evaluator_name: 'Prof. Alejandro Rivera', attendance: '', work: '', attitude: '', remarks: '' });

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const pendingApps = applications.filter(a => a.status === 'pending');

  const reviewRequirement = (submission_id, newStatus) => {
    setSubmissions(submissions.map(s =>
      s.submission_id === submission_id
        ? { ...s, status: newStatus, reviewed_by: 2, reviewed_at: new Date().toISOString(), remarks: newStatus === 'approved' ? 'Verified and approved' : 'Please resubmit with corrections' }
        : s
    ));
  };

  const approveApplication = (application_id) => {
    setApplications(applications.map(a =>
      a.application_id === application_id
        ? { ...a, status: 'accepted', approved_by: 2, approved_at: new Date().toISOString() }
        : a
    ));
  };

  const rejectApplication = (application_id) => {
    setApplications(applications.map(a =>
      a.application_id === application_id ? { ...a, status: 'rejected' } : a
    ));
  };

  const submitEvaluation = () => {
    const total = parseFloat(evalForm.attendance || 0) + parseFloat(evalForm.work || 0) + parseFloat(evalForm.attitude || 0);
    setEvaluations([...evaluations, {
      evaluation_id: evaluations.length + 1,
      placement_id: parseInt(evalForm.placement_id),
      evaluator_name: evalForm.evaluator_name,
      attendance_score: parseFloat(evalForm.attendance || 0),
      work_quality_score: parseFloat(evalForm.work || 0),
      attitude_score: parseFloat(evalForm.attitude || 0),
      total_score: parseFloat(total.toFixed(2)),
      remarks: evalForm.remarks,
      evaluated_at: new Date().toISOString()
    }]);
    setShowEvalModal(false);
  };

  const enrichedSubmissions = submissions.map(s => {
    const student = mockData.students.find(st => st.student_id === s.student_id);
    const reqType = mockData.requirement_types.find(r => r.requirement_id === s.requirement_id);
    return { ...s, student_name: student?.full_name || '—', student_number: student?.student_number || '—', requirement_name: reqType?.name || '—' };
  });

  const enrichedApps = applications.map(a => {
    const student = mockData.students.find(s => s.student_id === a.student_id);
    const company = mockData.companies.find(c => c.company_id === a.company_id);
    return { ...a, student_name: student?.full_name || '—', student_number: student?.student_number || '—', course: student?.course || '—', company_name: company?.company_name || '—', industry: company?.industry || '—' };
  });

  const pages = {
    dashboard: <StaffOverview pendingSubmissions={pendingSubmissions} pendingApps={pendingApps} evaluations={evaluations} announcements={mockData.announcements} notifications={mockData.notifications.filter(n => n.user_id === 2)} />,
    requirements: <ReviewRequirementsView enrichedSubmissions={enrichedSubmissions} onReview={reviewRequirement} />,
    applications: <ApplicationsView enrichedApps={enrichedApps} onApprove={approveApplication} onReject={rejectApplication} />,
    attendance: <AttendanceMonitorView placements={mockData.ojt_placements} students={mockData.students} companies={mockData.companies} attendance={mockData.attendance} />,
    evaluations: <EvaluationsView evaluations={evaluations} placements={mockData.ojt_placements} students={mockData.students} onAddEval={() => setShowEvalModal(true)} />
  };

  return (
    <>
      {showEvalModal && (
        <div className="modal-overlay" onClick={() => setShowEvalModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Submit Student Evaluation</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEvalModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Evaluator Name</label>
              <input className="form-input" value={evalForm.evaluator_name} onChange={e => setEvalForm({ ...evalForm, evaluator_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Attendance Score (max 35)</label>
              <input type="number" className="form-input" placeholder="e.g. 30" min="0" max="35" value={evalForm.attendance} onChange={e => setEvalForm({ ...evalForm, attendance: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Work Quality Score (max 35)</label>
              <input type="number" className="form-input" placeholder="e.g. 33" min="0" max="35" value={evalForm.work} onChange={e => setEvalForm({ ...evalForm, work: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Attitude Score (max 30)</label>
              <input type="number" className="form-input" placeholder="e.g. 28" min="0" max="30" value={evalForm.attitude} onChange={e => setEvalForm({ ...evalForm, attitude: e.target.value })} />
            </div>
            <div style={{ padding: '10px', background: 'rgba(56,189,248,0.06)', borderRadius: '8px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Total Score: <strong style={{ color: 'var(--text-accent)' }}>
                {(parseFloat(evalForm.attendance || 0) + parseFloat(evalForm.work || 0) + parseFloat(evalForm.attitude || 0)).toFixed(2)} / 100
              </strong>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea className="form-textarea" placeholder="Optional remarks..." value={evalForm.remarks} onChange={e => setEvalForm({ ...evalForm, remarks: e.target.value })} style={{ minHeight: '80px' }} />
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={submitEvaluation}>
              <Star size={16} /> Save Evaluation
            </button>
          </div>
        </div>
      )}
      <div className="page">{pages[activePage] || pages.dashboard}</div>
    </>
  );
}

function StaffOverview({ pendingSubmissions, pendingApps, evaluations, announcements, notifications }) {
  return (
    <>
      <div className="page-header">
        <h1>Coordinator Dashboard</h1>
        <p>Monitor students, review submissions, and manage OJT placements</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card cyan"><div className="stat-icon cyan"><FileCheck size={20} /></div><div><div className="stat-value">{pendingSubmissions.length}</div><div className="stat-label">Pending Requirements</div></div></div>
        <div className="stat-card purple"><div className="stat-icon purple"><Briefcase size={20} /></div><div><div className="stat-value">{pendingApps.length}</div><div className="stat-label">Pending Applications</div></div></div>
        <div className="stat-card green"><div className="stat-icon green"><Star size={20} /></div><div><div className="stat-value">{evaluations.length}</div><div className="stat-label">Evaluations Done</div></div></div>
        <div className="stat-card orange"><div className="stat-icon orange"><Bell size={20} /></div><div><div className="stat-value">{notifications.filter(n => !n.is_read).length}</div><div className="stat-label">Unread Alerts</div></div></div>
      </div>
      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Notifications</div></div>
          {notifications.length === 0 ? <div className="empty-state"><p>No notifications.</p></div> : notifications.map(n => (
            <div key={n.notification_id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
              <Bell size={16} color="var(--text-accent)" style={{ marginTop: 2 }} />
              <div><div className="notif-message">{n.message}</div><div className="notif-time">{new Date(n.created_at).toLocaleString()}</div></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Announcements</div></div>
          {announcements.map(a => (
            <div key={a.announcement_id} className="announcement-card">
              <div className="announcement-title">{a.title}</div>
              <div className="announcement-content">{a.content}</div>
              <div className="announcement-date">{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ReviewRequirementsView({ enrichedSubmissions, onReview }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? enrichedSubmissions : enrichedSubmissions.filter(s => s.status === filter);
  return (
    <>
      <div className="page-header"><h1>Review Requirements</h1><p>Approve or reject student document submissions</p></div>
      <div className="tab-group">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'pending' ? `(${enrichedSubmissions.filter(s => s.status === 'pending').length})` : ''}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Student No.</th><th>Requirement</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.submission_id}>
                  <td style={{ fontWeight: 600 }}>{s.student_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.student_number}</td>
                  <td>{s.requirement_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    {s.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-success btn-xs" onClick={() => onReview(s.submission_id, 'approved')}><CheckCircle2 size={12} /> Approve</button>
                        <button className="btn btn-danger btn-xs" onClick={() => onReview(s.submission_id, 'rejected')}><XCircle size={12} /> Reject</button>
                      </div>
                    ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.remarks || '—'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ApplicationsView({ enrichedApps, onApprove, onReject }) {
  return (
    <>
      <div className="page-header"><h1>Company Applications</h1><p>Review and approve student company placement applications</p></div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Course</th><th>Company</th><th>Industry</th><th>Applied</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {enrichedApps.map(a => (
                <tr key={a.application_id}>
                  <td style={{ fontWeight: 600 }}>{a.student_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.course}</td>
                  <td>{a.company_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.industry}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-success btn-xs" onClick={() => onApprove(a.application_id)}><CheckCircle2 size={12} /> Accept</button>
                        <button className="btn btn-danger btn-xs" onClick={() => onReject(a.application_id)}><XCircle size={12} /> Reject</button>
                      </div>
                    ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AttendanceMonitorView({ placements, students, companies, attendance }) {
  return (
    <>
      <div className="page-header"><h1>Attendance Monitor</h1><p>View student DTR records and placement hours progress</p></div>
      {placements.map(p => {
        const student = students.find(s => s.student_id === p.student_id);
        const company = companies.find(c => c.company_id === p.company_id);
        const records = attendance.filter(a => a.placement_id === p.placement_id);
        const pct = Math.min(Math.round((p.total_hours_rendered / p.required_hours) * 100), 100);
        return (
          <div key={p.placement_id} className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">{student?.full_name}</div>
                <div className="card-subtitle">{company?.company_name} · {student?.course}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="progress-container" style={{ marginBottom: '16px' }}>
              <div className="progress-label">
                <span className="text-sm text-muted">Hours Progress</span>
                <span className="text-sm fw-600 text-accent">{pct}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{p.total_hours_rendered}h rendered</span><span>{p.required_hours}h required</span>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Date</th><th>Time In</th><th>Time Out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {records.slice(-5).map(r => (
                    <tr key={r.attendance_id}>
                      <td>{r.log_date}</td><td>{r.time_in}</td><td>{r.time_out}</td>
                      <td style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{r.hours_rendered}h</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </>
  );
}

function EvaluationsView({ evaluations, placements, students, onAddEval }) {
  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h1>Student Evaluations</h1><p>Manage performance evaluation scores and remarks</p></div>
          <button className="btn btn-primary" onClick={onAddEval}><Star size={16} /> Add Evaluation</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {evaluations.map(e => {
          const placement = placements.find(p => p.placement_id === e.placement_id);
          const student = placement ? students.find(s => s.student_id === placement.student_id) : null;
          return (
            <div key={e.evaluation_id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{student?.full_name || 'Student'}</div>
                  <div className="card-subtitle">Evaluator: {e.evaluator_name}</div>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{e.total_score}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                {[['Attendance', e.attendance_score, 35], ['Work Quality', e.work_quality_score, 35], ['Attitude', e.attitude_score, 30]].map(([label, score, max]) => (
                  <div key={label} style={{ background: 'var(--color-bg-elevated)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{score}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label} / {max}</div>
                  </div>
                ))}
              </div>
              {e.remarks && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{e.remarks}"</div>}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>{new Date(e.evaluated_at).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
