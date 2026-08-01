import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import {
  LayoutDashboard, Users, FileCheck, Briefcase, ClipboardList,
  Star, CheckCircle2, XCircle, AlertCircle, Bell, Clock, TrendingUp, Building2, Eye, EyeOff
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

export default function StaffDashboard({ activePage, currentUser }) {
  const { mockData } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({ placement_id: 1, evaluator_name: 'Prof. Alejandro Rivera', attendance: '', work: '', attitude: '', remarks: '' });

  useEffect(() => {
    setSubmissions(mockData.student_requirements || []);
    setApplications(mockData.applications || []);
    setEvaluations(mockData.evaluations || []);
  }, [mockData.student_requirements, mockData.applications, mockData.evaluations]);

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const pendingApps = applications.filter(a => a.status === 'pending');

  const reviewRequirement = async (submission_id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/requirements/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id,
          status: newStatus,
          remarks: newStatus === 'approved' ? 'Verified and approved' : 'Please resubmit with corrections',
          reviewed_by: currentUser?.user_id || 2
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(submissions.map(s =>
          s.submission_id === submission_id
            ? { ...s, status: newStatus, reviewed_by: currentUser?.user_id || 2, reviewed_at: new Date().toISOString(), remarks: newStatus === 'approved' ? 'Verified and approved' : 'Please resubmit with corrections' }
            : s
        ));
      } else {
        alert(data.message || 'Failed to review requirement');
      }
    } catch (error) {
      alert('Server error while reviewing requirement');
    }
  };

  const approveApplication = async (application_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/applications/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id,
          approved_by: currentUser?.user_id || 2
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.map(a =>
          a.application_id === application_id
            ? { ...a, status: 'accepted', approved_by: currentUser?.user_id || 2, approved_at: new Date().toISOString() }
            : a
        ));
      } else {
        alert(data.message || 'Failed to approve application');
      }
    } catch (error) {
      alert('Server error while approving application');
    }
  };

  const rejectApplication = async (application_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/applications/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id })
      });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.map(a =>
          a.application_id === application_id ? { ...a, status: 'rejected' } : a
        ));
      } else {
        alert(data.message || 'Failed to reject application');
      }
    } catch (error) {
      alert('Server error while rejecting application');
    }
  };

  const submitEvaluation = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/evaluation/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_id: parseInt(evalForm.placement_id),
          evaluator_name: evalForm.evaluator_name,
          attendance_score: parseFloat(evalForm.attendance || 0),
          work_quality_score: parseFloat(evalForm.work || 0),
          attitude_score: parseFloat(evalForm.attitude || 0),
          remarks: evalForm.remarks
        })
      });
      const data = await res.json();
      if (data.success) {
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
      } else {
        alert(data.message || 'Failed to submit evaluation');
      }
    } catch (error) {
      alert('Server error while submitting evaluation');
    }
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
    dashboard: <StaffOverview pendingSubmissions={pendingSubmissions} pendingApps={pendingApps} evaluations={evaluations} announcements={mockData.announcements} notifications={mockData.notifications.filter(n => n.user_id === currentUser?.user_id)} />,
    profiling: <StudentProfilingView />,
    requirements: <ReviewRequirementsView enrichedSubmissions={enrichedSubmissions} onReview={reviewRequirement} />,
    applications: <ApplicationsView enrichedApps={enrichedApps} onApprove={approveApplication} onReject={rejectApplication} />,
    attendance: <AttendanceMonitorView placements={mockData.ojt_placements} students={mockData.students} companies={mockData.companies} attendance={mockData.attendance} />,
    evaluations: <EvaluationsView evaluations={evaluations} placements={mockData.ojt_placements} students={mockData.students} onAddEval={() => setShowEvalModal(true)} />,
    profile: <StaffProfileView currentUser={currentUser} />
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
        <div className="stat-card cyan animate-fade-in-up delay-100"><div className="stat-icon cyan"><FileCheck size={20} /></div><div><div className="stat-value">{pendingSubmissions.length}</div><div className="stat-label">Pending Requirements</div></div></div>
        <div className="stat-card purple animate-fade-in-up delay-200"><div className="stat-icon purple"><Briefcase size={20} /></div><div><div className="stat-value">{pendingApps.length}</div><div className="stat-label">Pending Applications</div></div></div>
        <div className="stat-card green animate-fade-in-up delay-300"><div className="stat-icon green"><Star size={20} /></div><div><div className="stat-value">{evaluations.length}</div><div className="stat-label">Evaluations Done</div></div></div>
        <div className="stat-card orange animate-fade-in-up delay-400"><div className="stat-icon orange"><Bell size={20} /></div><div><div className="stat-value">{notifications.filter(n => !n.is_read).length}</div><div className="stat-label">Unread Alerts</div></div></div>
      </div>
      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card animate-fade-in-up delay-200">
          <div className="card-header"><div className="card-title">Recent Notifications</div></div>
          {notifications.length === 0 ? <div className="empty-state"><p>No notifications.</p></div> : notifications.map(n => (
            <div key={n.notification_id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
              <Bell size={16} color="var(--text-accent)" style={{ marginTop: 2 }} />
              <div><div className="notif-message">{n.message}</div><div className="notif-time">{new Date(n.created_at).toLocaleString()}</div></div>
            </div>
          ))}
        </div>
        <div className="card animate-fade-in-up delay-500">
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

function StudentProfilingView() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    course: '',
    year_section: '',
    gender: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleNameChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    const first = updatedForm.first_name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const last = updatedForm.last_name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const autoGen = first && last ? `${first}${last}` : '';
    
    setFormData({
      ...updatedForm,
      email: autoGen ? `${autoGen}@gmail.com` : updatedForm.email,
      password: autoGen ? `${autoGen}123` : updatedForm.password
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: `${formData.first_name} ${formData.last_name}`,
          gender: formData.gender,
          course: formData.course,
          year_section: formData.year_section
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Account created successfully! Admin approval is pending. (Email: ${formData.email})` });
        setFormData({ first_name: '', last_name: '', course: '', year_section: '', gender: '', email: '', password: '' });
      } else {
        setMsg({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Server error while registering student.' });
    }
    setLoading(false);
  };

  return (
    <>
      <div className="page-header">
        <h1>Student Profiling</h1>
        <p>Create a new student account and profile for OJT</p>
      </div>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" required value={formData.first_name} onChange={e => handleNameChange('first_name', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" required value={formData.last_name} onChange={e => handleNameChange('last_name', e.target.value)} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Course</label>
            <input type="text" className="form-input" required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Year and Section</label>
            <input type="text" className="form-input" required value={formData.year_section} onChange={e => setFormData({...formData, year_section: e.target.value})} placeholder="e.g. 4th Year - Section A" />
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

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. jdelacruz@busi.edu.ph" />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} className="form-input" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {msg.text && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '0.9rem',
              backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              color: msg.type === 'success' ? '#10b981' : '#f43f5e',
              border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {msg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Creating...' : 'Create Student Profile'}
          </button>
        </form>
      </div>
    </>
  );
}

function StaffProfileView({ currentUser }) {
  const [formData, setFormData] = useState({
    first_name: currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ')[0] : '',
    last_name: currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ').slice(1).join(' ') : '',
    email: currentUser?.email || '',
    password: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { updateCurrentUser } = useAuth();

  useEffect(() => {
    setFormData({
      first_name: currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ')[0] : '',
      last_name: currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ').slice(1).join(' ') : '',
      email: currentUser?.email || '',
      password: ''
    });
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          role: currentUser.role,
          email: formData.email,
          password: formData.password,
          full_name: `${formData.first_name} ${formData.last_name}`.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        updateCurrentUser(data.user);
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        setMsg({ type: 'error', text: data.message || 'Unable to update profile' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Server error while updating profile' });
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>
      <div className="card animate-fade-in-up delay-100" style={{ maxWidth: '600px' }}>
        <div className="card-header"><div className="card-title">Edit Profile</div></div>
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
