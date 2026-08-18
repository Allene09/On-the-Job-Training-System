import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL, { fetchWithAuth } from '../../config/api';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Users, FileCheck, Briefcase, ClipboardList,
  Star, CheckCircle2, XCircle, AlertCircle, Bell, Clock, TrendingUp, Building2, Eye, EyeOff,
  Lock, Shield, Copy, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

function StatusBadge({ status }) {
  const map = {
    approved: 'badge-approved', accepted: 'badge-accepted', completed: 'badge-completed',
    active: 'badge-active', pending: 'badge-pending', submitted: 'badge-submitted',
    ongoing: 'badge-ongoing', rejected: 'badge-rejected', reviewed: 'badge-approved'
  };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export default function StaffDashboard({ activePage, currentUser }) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({ placement_id: '', evaluator_name: 'Prof. Alejandro Rivera', attendance: '', work: '', attitude: '', remarks: '' });
  const [reqFilter, setReqFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [fullDataRes, annRes, notifRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/staff/full-data`),
          fetchWithAuth(`${API_BASE_URL}/admin/announcements`),
          fetchWithAuth(`${API_BASE_URL}/admin/notifications?user_id=${currentUser.user_id}`)
        ]);

        if (!isMounted) return;

        const fullData = fullDataRes.ok ? await fullDataRes.json() : { data: {} };
        const annData = annRes.ok ? await annRes.json() : { data: [] };
        const notData = notifRes.ok ? await notifRes.json() : { data: [] };

        const fd = fullData.data || {};
        setSubmissions(fd.requirements || []);
        setApplications(fd.applications || []);
        setEvaluations(fd.evaluations || []);
        setPlacements(fd.placements || []);
        setAttendance(fd.attendance || []);
        setStudents(fd.students || []);
        setCompanies(fd.companies || []);

        setAnnouncements(annData.data || []);
        setNotifications(notData.data || []);
      } catch (err) {
        console.error("Error loading staff dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentUser]);

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const pendingApps = applications.filter(a => a.status === 'pending');

  const reviewRequirement = async (submission_id, newStatus) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/staff/requirements/review`, {
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
        toast.success(`Requirement ${newStatus}`);
      } else {
        toast.error(data.message || 'Failed to review requirement');
      }
    } catch (error) {
      toast.error('Server error while reviewing requirement');
    }
  };

  const approveApplication = async (application_id) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/staff/applications/approve`, {
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
        toast.success('Application approved successfully!');
      } else {
        toast.error(data.message || 'Failed to approve application');
      }
    } catch (error) {
      toast.error('Server error while approving application');
    }
  };

  const rejectApplication = async (application_id) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/staff/applications/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id })
      });
      const data = await res.json();
      if (data.success) {
        setApplications(applications.map(a =>
          a.application_id === application_id ? { ...a, status: 'rejected' } : a
        ));
        toast.success('Application rejected.');
      } else {
        toast.error(data.message || 'Failed to reject application');
      }
    } catch (error) {
      toast.error('Server error while rejecting application');
    }
  };

  const submitEvaluation = async () => {
    const att = parseFloat(evalForm.attendance || 0);
    const work = parseFloat(evalForm.work || 0);
    const attitude = parseFloat(evalForm.attitude || 0);
    
    if (att > 35 || work > 35 || attitude > 30) {
      toast.error("Scores exceed maximum allowed values (Attendance: 35, Work: 35, Attitude: 30)");
      return;
    }
    
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/staff/evaluation/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_id: parseInt(evalForm.placement_id),
          evaluator_name: evalForm.evaluator_name,
          attendance_score: att,
          work_quality_score: work,
          attitude_score: attitude,
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
        setEvalForm({ placement_id: '', evaluator_name: 'Prof. Alejandro Rivera', attendance: '', work: '', attitude: '', remarks: '' });
        toast.success('Evaluation submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit evaluation');
      }
    } catch (error) {
      toast.error('Server error while submitting evaluation');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Clock size={32} />
        </motion.div>
        <span style={{ marginLeft: '12px' }}>Loading Staff Dashboard...</span>
      </div>
    );
  }

  const pages = {
    dashboard: <StaffOverview pendingSubmissions={pendingSubmissions} pendingApps={pendingApps} evaluations={evaluations} announcements={announcements} notifications={notifications} />,
    profiling: <StudentProfilingView />,
    requirements: <ReviewRequirementsView enrichedSubmissions={submissions} onReview={reviewRequirement} filter={reqFilter} setFilter={setReqFilter} />,
    applications: <ApplicationsView enrichedApps={applications} onApprove={approveApplication} onReject={rejectApplication} />,
    attendance: <AttendanceMonitorView placements={placements} students={students} companies={companies} attendance={attendance} />,
    evaluations: <EvaluationsView evaluations={evaluations} placements={placements} students={students} onAddEval={() => setShowEvalModal(true)} />,
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
              <label className="form-label">Student Placement</label>
              <select className="form-input" value={evalForm.placement_id} onChange={e => setEvalForm({ ...evalForm, placement_id: e.target.value })}>
                <option value="">Select a student placement</option>
                {placements.map(p => {
                  const s = students.find(st => st.student_id === p.student_id);
                  return <option key={p.placement_id} value={p.placement_id}>{s ? s.full_name : `Placement #${p.placement_id}`}</option>
                })}
              </select>
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
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => {
              if (!evalForm.placement_id) return toast.error('Please select a student placement');
              submitEvaluation();
            }}>
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
      <div className="bento-grid">
        <motion.div className="bento-card col-span-3 stat-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon cyan"><FileCheck size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{pendingSubmissions.length}</div><div className="stat-label">Pending Requirements</div></div>
        </motion.div>
        <motion.div className="bento-card col-span-3 stat-card purple" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon purple"><Briefcase size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{pendingApps.length}</div><div className="stat-label">Pending Applications</div></div>
        </motion.div>
        <motion.div className="bento-card col-span-3 stat-card green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon green"><Star size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{evaluations.length}</div><div className="stat-label">Evaluations Done</div></div>
        </motion.div>
        <motion.div className="bento-card col-span-3 stat-card orange" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="stat-icon orange"><Bell size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{notifications.filter(n => !n.is_read).length}</div><div className="stat-label">Unread Alerts</div></div>
        </motion.div>

        <motion.div className="bento-card col-span-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <div className="card-header"><div className="card-title">Recent Notifications</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.length === 0 ? <div className="empty-state"><p>No notifications.</p></div> : notifications.map((n, idx) => (
              <div key={n.notification_id || idx} className={`notif-item ${n.is_read ? '' : 'unread'}`} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Bell size={18} color="var(--text-accent)" style={{ marginTop: 2 }} />
                <div><div className="notif-message" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.message}</div><div className="notif-time" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</div></div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="bento-card col-span-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <div className="card-header"><div className="card-title">Announcements</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map((a, idx) => (
              <div key={a.announcement_id || idx} className="announcement-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                <div className="announcement-title" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                <div className="announcement-content" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0' }}>{a.content}</div>
                <div className="announcement-date" style={{ fontSize: '0.7rem', color: 'var(--text-accent)' }}>{new Date(a.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ReviewRequirementsView({ enrichedSubmissions, onReview, filter, setFilter }) {
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
      <div className="form-group">
        <label className="form-label">Remarks</label>
        <textarea className="form-textarea" placeholder="e.g. Excellent technical performance and teamwork" value={evalForm.remarks} onChange={e => setEvalForm({ ...evalForm, remarks: e.target.value })} style={{ minHeight: '80px' }} />
      </div>
      <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => {
        if (!evalForm.placement_id) return toast.error('Please select a student placement');
        submitEvaluation();
      }}>
        <Star size={16} /> Save Evaluation
      </button>
    </>
  );
}

function StudentProfilingView() {
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    course: '',
    year_section: '',
    gender: '',
    contact_number: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateStudentId();
  }, []);

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    setFormData(prev => ({ ...prev, student_number: `${year}-${random}` }));
  };

  const handleNameChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    const first = updatedForm.first_name.toLowerCase().trim().replace(/\s+/g, '');
    const last = updatedForm.last_name.toLowerCase().trim().replace(/\s+/g, '');
    const autoGen = first && last ? `${first}.${last}@bisu.edu.ph` : '';

    setFormData({
      ...updatedForm,
      email: autoGen
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contact_number && formData.contact_number.length !== 11) {
      toast.error('Contact number must be exactly 11 digits (e.g. 09123456789)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: formData.student_number,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          email: formData.email,
          password: 'PENDING_APPROVAL',
          gender: formData.gender,
          course: formData.course,
          year_section: formData.year_section,
          year_level: formData.year_section,
          contact_number: formData.contact_number,
          address: formData.address,
          company_id: null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Account created successfully! Admin approval is pending. (Email: ${formData.email})`);
        setFormData({ first_name: '', middle_name: '', last_name: '', course: '', year_section: '', gender: '', contact_number: '', address: '', email: '', student_number: '' });
        generateStudentId();
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('Server error while registering student.');
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
          <div className="form-group">
            <label className="form-label">Student ID Number</label>
            <input type="text" className="form-input" required readOnly value={formData.student_number} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Last Name *</label>
              <input type="text" className="form-input" required value={formData.last_name} onChange={e => handleNameChange('last_name', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Middle Name</label>
              <input type="text" className="form-input" value={formData.middle_name} onChange={e => handleNameChange('middle_name', e.target.value)} placeholder="e.g. Santos" />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">First Name *</label>
              <input type="text" className="form-input" required value={formData.first_name} onChange={e => handleNameChange('first_name', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course</label>
            <input type="text" className="form-input" required value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} placeholder="e.g. BS Computer Science" />
          </div>

          <div className="form-group">
            <label className="form-label">Year and Section</label>
            <input type="text" className="form-input" required value={formData.year_section} onChange={e => setFormData({ ...formData, year_section: e.target.value })} placeholder="e.g. 4th Year - Section A" />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-input" required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                className="form-input"
                placeholder="e.g. 09123456789"
                value={formData.contact_number}
                onChange={e => setFormData({ ...formData, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tagbilaran City, Bohol"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="divider" style={{ margin: '12px 0 4px 0', borderColor: 'var(--color-border)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Account Information</h3>

          <div className="form-group">
            <label className="form-label">Email Address (Auto-generated)</label>
            <input type="email" className="form-input" required readOnly value={formData.email} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Creating...' : 'Create Student Profile'}
          </button>
        </form>
      </div>
    </>
  );
}

function StaffProfileView({ currentUser }) {
  const [formData, setFormData] = useState({
    first_name: currentUser?.profile?.first_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ')[0] : ''),
    middle_name: currentUser?.profile?.middle_name || '',
    last_name: currentUser?.profile?.last_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ').slice(1).join(' ') : ''),
    email: currentUser?.email || '',
    employee_id: currentUser?.profile?.employee_id || '',
    department: currentUser?.profile?.department || '',
    contact_number: currentUser?.profile?.contact_number || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { updateCurrentUser } = useAuth();

  useEffect(() => {
    setFormData({
      first_name: currentUser?.profile?.first_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ')[0] : ''),
      middle_name: currentUser?.profile?.middle_name || '',
      last_name: currentUser?.profile?.last_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ').slice(1).join(' ') : ''),
      email: currentUser?.email || '',
      employee_id: currentUser?.profile?.employee_id || '',
      department: currentUser?.profile?.department || '',
      contact_number: currentUser?.profile?.contact_number || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (formData.new_password) {
      if (formData.new_password.length < 6) {
        setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
        toast.error('New password must be at least 6 characters long.');
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        setMsg({ type: 'error', text: 'New password and confirm password do not match.' });
        toast.error('New password and confirm password do not match.');
        return;
      }
      if (!formData.current_password) {
        setMsg({ type: 'error', text: 'Please enter your current password to set a new password.' });
        toast.error('Please enter your current password to set a new password.');
        return;
      }
    }

    if (formData.contact_number && formData.contact_number.length !== 11) {
      setMsg({ type: 'error', text: 'Contact number must be exactly 11 digits (e.g. 09123456789)' });
      toast.error('Contact number must be exactly 11 digits (e.g. 09123456789)');
      return;
    }

    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          role: currentUser.role,
          email: formData.email,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          employee_id: formData.employee_id,
          department: formData.department,
          contact_number: formData.contact_number,
          current_password: formData.current_password,
          password: formData.new_password,
          confirm_password: formData.confirm_password,
          full_name: [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ').trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        updateCurrentUser(data.user);
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        toast.success('Profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
      } else {
        setMsg({ type: 'error', text: data.message || 'Unable to update profile' });
        toast.error(data.message || 'Unable to update profile');
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Server error while updating profile' });
      toast.error('Server error while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ') || currentUser?.profile?.full_name || 'Staff Member';

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your coordinator account settings and personal details</p>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
          borderRadius: '16px', padding: '20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(168,85,247,0.15)', color: '#a855f7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800
          }}>
            {displayName[0] ? displayName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {formData.employee_id ? `Employee ID: ${formData.employee_id} • ` : ''}{currentUser?.email}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <span className="badge badge-submitted"><span className="badge-dot" /> OJT Coordinator</span>
              {formData.department && <span className="badge badge-active">{formData.department}</span>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Coordinator Information</div></div>

          {msg.text && (
            <div style={{
              padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.86rem',
              background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)',
              color: msg.type === 'success' ? 'var(--status-approved)' : 'var(--status-rejected)',
              border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.25)'}`
            }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Middle Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Santos"
                  value={formData.middle_name}
                  onChange={e => setFormData({ ...formData, middle_name: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  value={formData.employee_id}
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. College of Technology"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  className="form-input"
                  placeholder="e.g. 09123456789"
                  value={formData.contact_number}
                  onChange={e => setFormData({ ...formData, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ margin: '24px 0 16px 0', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                <Lock size={16} color="var(--primary-color)" /> Change Password
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Leave password fields blank if you do not wish to change your password.
              </p>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter current password to verify"
                    value={formData.current_password}
                    onChange={e => setFormData({ ...formData, current_password: e.target.value })}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={formData.new_password}
                      onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Re-enter new password"
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
