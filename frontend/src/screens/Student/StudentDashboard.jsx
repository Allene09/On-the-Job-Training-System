import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL, { fetchWithAuth } from '../../config/api';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Building2, Clock, BookOpen,
  TrendingUp, Bell, Star, CheckCircle2, XCircle, AlertCircle,
  Plus, Send, ChevronRight, Award, Search, MapPin, Briefcase, Users, Save,
  Eye, EyeOff, Lock, Unlock, Copy, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

function StatusBadge({ status }) {
  const map = {
    approved: 'badge-approved', accepted: 'badge-accepted', completed: 'badge-completed',
    pending: 'badge-pending', submitted: 'badge-submitted', ongoing: 'badge-ongoing',
    rejected: 'badge-rejected', terminated: 'badge-terminated'
  };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
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
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(currentUser?.profile || {});
  const [placement, setPlacement] = useState(null);
  const [company, setCompany] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [reqTypes, setReqTypes] = useState([]);

  const [showDTRModal, setShowDTRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [dtrForm, setDtrForm] = useState({ date: '', time_in: '08:00', time_out: '17:00' });
  const [reportForm, setReportForm] = useState({ week: '', narrative: '' });
  
  const [dtrError, setDtrError] = useState('');
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const studentId = currentUser?.profile?.student_id || 1;

        const [
          dashboardRes,
          companiesRes,
          reqsRes,
          applicationsRes,
          announcementsRes,
          reportsRes,
          notifsRes,
          reqTypesRes
        ] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/student/dashboard`),
          fetchWithAuth(`${API_BASE_URL}/companies`),
          fetchWithAuth(`${API_BASE_URL}/student/requirements?student_id=${studentId}`),
          fetchWithAuth(`${API_BASE_URL}/student/placements?student_id=${studentId}`),
          fetchWithAuth(`${API_BASE_URL}/admin/announcements`),
          fetchWithAuth(`${API_BASE_URL}/student/weekly-reports?student_id=${studentId}`),
          fetchWithAuth(`${API_BASE_URL}/admin/notifications?user_id=${currentUser.user_id}`),
          fetchWithAuth(`${API_BASE_URL}/requirements/types`)
        ]);

        if (!isMounted) return;

        const dbData = dashboardRes.ok ? await dashboardRes.json() : { data: {} };
        const compData = companiesRes.ok ? await companiesRes.json() : { data: [] };
        const reqData = reqsRes.ok ? await reqsRes.json() : { data: [] };
        const appData = applicationsRes.ok ? await applicationsRes.json() : { data: [] };
        const annData = announcementsRes.ok ? await announcementsRes.json() : { data: [] };
        const repData = reportsRes.ok ? await reportsRes.json() : { data: [] };
        const notData = notifsRes.ok ? await notifsRes.json() : { data: [] };
        const rtData = reqTypesRes.ok ? await reqTypesRes.json() : { data: [] };

        const p = dbData.data.active_placement || null;
        setPlacement(p);
        setAttendance(dbData.data.recent_attendance || []);
        setEvaluations(dbData.data.recent_evaluations || []);
        
        const allCompanies = compData.data || [];
        setCompanies(allCompanies);
        if (p) {
          setCompany(allCompanies.find(c => c.company_id === p.company_id) || null);
        }

        setRequirements(reqData.data || []);
        setApplications(appData.data || []);
        setAnnouncements(annData.data || []);
        setReports(repData.data || []);
        setNotifications(notData.data || []);
        setReqTypes(rtData.data || []);

      } catch (err) {
        console.error("Error loading student data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentUser]);

  const unreadNotifs = notifications.filter(n => !n.is_read);

  // Total hours from attendance for this student
  const totalHours = attendance
    .filter(a => a.placement_id === placement?.placement_id)
    .reduce((sum, a) => sum + (parseFloat(a.hours_rendered) || 0), 0);
  const hoursRendered = parseFloat(totalHours.toFixed(2));

  const logDTR = async () => {
    setDtrError('');
    if (!dtrForm.date || !dtrForm.time_in || !dtrForm.time_out) {
      setDtrError('All fields are required.');
      return;
    }
    if (!placement) {
      setDtrError('No active placement found to log attendance for.');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/attendance/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_id: placement.placement_id,
          log_date: dtrForm.date,
          time_in: dtrForm.time_in,
          time_out: dtrForm.time_out
        })
      });
      const data = await res.json();
      if (data.success) {
        setAttendance([data.data, ...attendance]);
        setShowDTRModal(false);
        setDtrForm({ date: '', time_in: '08:00', time_out: '17:00' });
        toast.success('DTR logged successfully!');
      } else {
        setDtrError(data.message || 'Failed to log DTR');
      }
    } catch (error) {
      setDtrError('Server error while logging DTR');
    }
  };

  const submitReport = async () => {
    setReportError('');
    if (!reportForm.week || !reportForm.narrative) {
      setReportError('Week number and narrative are required.');
      return;
    }
    if (!placement) {
      setReportError('No active placement found.');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/student/weekly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_id: placement.placement_id,
          week_number: parseInt(reportForm.week),
          narrative: reportForm.narrative
        })
      });
      const data = await res.json();
      if (data.success) {
        setReports([{
          report_id: data.data?.report_id || reports.length + 1,
          placement_id: placement.placement_id,
          week_number: parseInt(reportForm.week),
          narrative: reportForm.narrative,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          reviewed_by: null
        }, ...reports]);
        setShowReportModal(false);
        setReportForm({ week: '', narrative: '' });
        toast.success('Weekly report submitted!');
      } else {
        setReportError(data.message || 'Failed to submit report');
      }
    } catch (error) {
      setReportError('Server error while submitting report');
    }
  };

  const applyCompany = async (company_id) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/student/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student?.student_id, company_id })
      });
      const data = await res.json();
      if (data.success) {
        setApplications([...applications, {
          application_id: applications.length + 1,
          student_id: student?.student_id,
          company_id,
          status: 'pending',
          applied_at: new Date().toISOString()
        }]);
        toast.success('Application submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to apply');
      }
    } catch (error) {
      toast.error('Server error while applying to company');
    }
  };

  const submitRequirement = async (req_id) => {
    const file_path = `/uploads/doc_${Date.now()}.pdf`;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/student/requirements/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student?.student_id, requirement_id: req_id, file_path })
      });
      const data = await res.json();
      if (data.success) {
        setRequirements(requirements.map(r => r.requirement_id === req_id ? {
          ...r, submission: {
            submission_id: Date.now(),
            file_path,
            status: 'pending',
            submitted_at: new Date().toISOString()
          }
        } : r));
        toast.success('Requirement submitted!');
      } else {
        toast.error(data.message || 'Failed to submit requirement');
      }
    } catch (error) {
      toast.error('Server error while submitting requirement');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Clock size={32} />
        </motion.div>
        <span style={{ marginLeft: '12px' }}>Loading Dashboard...</span>
      </div>
    );
  }

  const pages = {
    dashboard: <DashboardView student={student} placement={placement} company={company} hoursRendered={hoursRendered} notifications={notifications} unreadNotifs={unreadNotifs} evaluations={evaluations} announcements={announcements} />,
    profile: <ProfileView student={student} currentUser={currentUser} setStudent={setStudent} />,
    requirements: <RequirementsView reqChecklist={requirements} onSubmit={submitRequirement} />,
    companies: <CompaniesView companies={companies} applications={applications} onApply={applyCompany} student={student} />,
    attendance: <AttendanceView attendance={attendance} hoursRendered={hoursRendered} required={student.required_hours} onAddDTR={() => setShowDTRModal(true)} />,
    reports: <ReportsView reports={reports} onAdd={() => setShowReportModal(true)} />,
    progress: <ProgressView placement={placement} hoursRendered={hoursRendered} evaluations={evaluations} company={company} />
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
            {dtrError && (
              <div style={{ padding: '10px', background: 'rgba(244,63,94,0.1)', color: 'var(--status-rejected)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {dtrError}
              </div>
            )}
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
              <Save size={16} /> Save DTR Record
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
            {reportError && (
              <div style={{ padding: '10px', background: 'rgba(244,63,94,0.1)', color: 'var(--status-rejected)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {reportError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Week Number</label>
              <input type="number" className="form-input" placeholder="e.g. 2" min="1" value={reportForm.week} onChange={e => setReportForm({ ...reportForm, week: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Narrative / Summary of Activities</label>
              <textarea className="form-textarea" placeholder="Describe your tasks and learnings for this week..." value={reportForm.narrative} onChange={e => setReportForm({ ...reportForm, narrative: e.target.value })} style={{ minHeight: '120px' }} />
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={submitReport}>
              <FileText size={16} /> Submit Report
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
  const progress = placement && student?.required_hours ? Math.min(Math.round((hoursRendered / student.required_hours) * 100), 100) : 0;
  
  const requiredHours = student?.required_hours || 0;
  const hoursRemaining = requiredHours - hoursRendered > 0 ? (requiredHours - hoursRendered).toFixed(1) : 0;

  return (
    <>
      <div className="page-header">
        <h1>Welcome back, {student?.full_name?.split(' ')[0] || 'Student'} 👋</h1>
        <p>{student?.course || 'N/A'} · {student?.year_level || 'N/A'} · {student?.student_number || 'N/A'}</p>
      </div>

      <div className="bento-grid">
        <motion.div className="bento-card col-span-3 stat-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon cyan"><TrendingUp size={24} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>{hoursRendered}h</div>
            <div className="stat-label">Hours Rendered</div>
          </div>
        </motion.div>

        <motion.div className="bento-card col-span-3 stat-card purple" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon purple"><Clock size={24} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>{hoursRemaining}h</div>
            <div className="stat-label">Hours Remaining</div>
          </div>
        </motion.div>

        <motion.div className="bento-card col-span-3 stat-card green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon green"><Award size={24} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>{latestEval ? `${latestEval.total_score}%` : 'N/A'}</div>
            <div className="stat-label">Latest Score</div>
          </div>
        </motion.div>

        <motion.div className="bento-card col-span-3 stat-card orange" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="stat-icon orange"><Bell size={24} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>{unreadNotifs.length}</div>
            <div className="stat-label">Notifications</div>
          </div>
        </motion.div>

        <motion.div className="bento-card col-span-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ fontSize: '1.25rem' }}>OJT Progress</div>
              <div className="card-subtitle">{company?.company_name || 'No placement yet'}</div>
            </div>
            <span className={`badge ${placement?.status === 'ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
              <span className="badge-dot" /> {placement?.status || 'N/A'}
            </span>
          </div>
          {placement ? (
            <>
              <ProgressBar value={hoursRendered} max={requiredHours} label="OJT Hours Completion" />
              <div className="divider" style={{ margin: '24px 0', borderColor: 'var(--color-border)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date</div>{placement.start_date}</div>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>End Date</div>{placement.end_date}</div>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Company</div>{company?.company_name}</div>
                <div><div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Industry</div>{company?.industry}</div>
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No active placement found.</p></div>
          )}
        </motion.div>

        <motion.div className="bento-card col-span-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <div className="card-header">
            <div className="card-title">Announcements</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map(a => (
              <div key={a.announcement_id} className="announcement-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                <div className="announcement-title" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                <div className="announcement-content" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0' }}>{a.content}</div>
                <div className="announcement-date" style={{ fontSize: '0.7rem', color: 'var(--text-accent)' }}>{new Date(a.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div className="bento-card col-span-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="card-header">
            <div className="card-title">Recent Notifications</div>
            {unreadNotifs.length > 0 && <span className="badge badge-pending">{unreadNotifs.length} new</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}><p>No notifications yet.</p></div>
            ) : (
              notifications.map(n => (
                <div key={n.notification_id} className={`notif-item ${n.is_read ? '' : 'unread'}`} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ color: n.type === 'approval' ? 'var(--status-approved)' : n.type === 'rejection' ? 'var(--status-rejected)' : 'var(--text-accent)' }}>
                    {n.type === 'approval' ? <CheckCircle2 size={18} /> : n.type === 'rejection' ? <XCircle size={18} /> : <Bell size={18} />}
                  </div>
                  <div>
                    <div className="notif-message" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.message}</div>
                    <div className="notif-time" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
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
            const app = applications.find(a => a.student_id === student?.student_id && a.company_id === c.company_id);
            return (
              <div key={c.company_id} className="company-card" style={{ opacity: isFull ? 0.72 : 1, position: 'relative' }}>

                {/* Full badge overlay */}
                {isFull && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Full
                  </div>
                )}

                {/* Company Photo */}
                <div style={{ height: '120px', borderRadius: '12px 12px 0 0', background: `url(${c.photo_url ? API_BASE_URL.replace('/api', '') + c.photo_url : ''}) center/cover no-repeat`, backgroundColor: '#1e293b', marginBottom: '12px', marginTop: '-16px', marginLeft: '-16px', paddingRight: '32px', width: 'calc(100% + 32px)' }} />

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
        <ProgressBar value={hoursRendered} max={required || 0} label="Total Hours Rendered" />
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
              {sorted.map((a, i) => (
                <tr key={a.attendance_id || i}>
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
          reports.map((r, i) => (
            <div key={r.report_id || i} className="card">
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

function ProfileView({ student, currentUser, setStudent }) {
  const [formData, setFormData] = useState({
    first_name: student?.first_name || (student?.full_name ? student.full_name.split(' ')[0] : ''),
    middle_name: student?.middle_name || '',
    last_name: student?.last_name || (student?.full_name ? student.full_name.split(' ').slice(1).join(' ') : ''),
    student_number: student?.student_number || '',
    course: student?.course || '',
    year_section: student?.year_level || '',
    gender: student?.gender || '',
    contact_number: student?.contact_number || '',
    address: student?.address || '',
    email: currentUser?.email || '',
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
      first_name: student?.first_name || (student?.full_name ? student.full_name.split(' ')[0] : ''),
      middle_name: student?.middle_name || '',
      last_name: student?.last_name || (student?.full_name ? student.full_name.split(' ').slice(1).join(' ') : ''),
      student_number: student?.student_number || '',
      course: student?.course || '',
      year_section: student?.year_level || '',
      gender: student?.gender || '',
      contact_number: student?.contact_number || '',
      address: student?.address || '',
      email: currentUser?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  }, [student, currentUser?.email]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (formData.new_password || formData.confirm_password) {
      if (!formData.current_password) {
        setMsg({ type: 'error', text: 'Current password is required to set a new password.' });
        return;
      }
      if (formData.new_password.length < 6) {
        setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        setMsg({ type: 'error', text: 'New password and Confirm password do not match.' });
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
          student_number: formData.student_number,
          course: formData.course,
          year_level: formData.year_section,
          gender: formData.gender,
          contact_number: formData.contact_number,
          address: formData.address,
          current_password: formData.current_password,
          password: formData.new_password,
          confirm_password: formData.confirm_password,
          full_name: [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ').trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        updateCurrentUser(data.user);
        if (data.user.profile) {
          setStudent(data.user.profile);
        }
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

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal student account settings and credentials</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Card Header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 700, color: '#fff',
            boxShadow: '0 4px 14px rgba(56,189,248,0.3)'
          }}>
            {formData.first_name ? formData.first_name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {[formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ') || currentUser?.full_name || 'Student User'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{formData.course || 'Student'}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-accent)' }}>{formData.email}</span>
              {formData.student_number && (
                <>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {formData.student_number}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card">
          <div className="card-header"><div className="card-title">Profile Information</div></div>

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
                <label className="form-label">Student ID Number</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  value={formData.student_number}
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Gender</label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Course</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Year and Section</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.year_section}
                  onChange={e => setFormData({ ...formData, year_section: e.target.value })}
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

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
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
