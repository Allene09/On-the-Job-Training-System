import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import {
  Users, Building2, FileText, BarChart3, Plus, Settings,
  TrendingUp, Clock, CheckCircle2, XCircle, Bell, Search, AlertCircle, Eye, EyeOff
} from 'lucide-react';

function StatusBadge({ status }) {
  const map = { active: 'badge-active', inactive: 'badge-rejected', pending: 'badge-pending', approved: 'badge-approved', student: 'badge-ongoing', staff: 'badge-submitted', admin: 'badge-approved' };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminDashboard({ activePage, currentUser }) {
  const { mockData } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [reqTypes, setReqTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [companyForm, setCompanyForm] = useState({ company_name: '', industry: '', address: '', contact_person: '', contact_number: '', email: '', slots_available: 5, photo_url: '', requirements: '' });
  const [reqForm, setReqForm] = useState({ name: '', description: '', is_required: true, deadline: '' });
  const [userForm, setUserForm] = useState({
    role: 'student',
    full_name: '',
    email: '',
    password: '',
    student_number: '',
    course: '',
    year_level: '',
    employee_id: '',
    department: ''
  });
  const [userFormError, setUserFormError] = useState('');

  const handleUserFullNameChange = (e) => {
    const name = e.target.value;
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    setUserForm({ 
      ...userForm, 
      full_name: name,
      email: cleanName ? `${cleanName}@gmail.com` : '',
      password: cleanName ? `${cleanName}123` : ''
    });
  };

  useEffect(() => {
    setCompanies(mockData.companies || []);
    setReqTypes(mockData.requirement_types || []);
    setUsers(mockData.users || []);
    setStudents(mockData.students || []);
    setStaff(mockData.staff || []);
  }, [mockData.companies, mockData.requirement_types, mockData.users, mockData.students, mockData.staff]);

  const addCompany = async () => {
    if (!companyForm.company_name) return;
    try {
      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...companyForm, added_by: currentUser?.user_id || 1 })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies([...companies, { ...companyForm, company_id: data.data.company_id, status: 'active', added_by: currentUser?.user_id || 1, created_at: new Date().toISOString(), slots_available: parseInt(companyForm.slots_available) }]);
        setShowCompanyModal(false);
        setCompanyForm({ company_name: '', industry: '', address: '', contact_person: '', contact_number: '', email: '', slots_available: 5, photo_url: '', requirements: '' });
      } else {
        alert(data.message || 'Failed to add company');
      }
    } catch (error) {
      alert('Server error while adding company');
    }
  };

  const addRequirement = async () => {
    if (!reqForm.name) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/requirements/type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqForm)
      });
      const data = await res.json();
      if (data.success) {
        setReqTypes([...reqTypes, data.data]);
        setShowReqModal(false);
        setReqForm({ name: '', description: '', is_required: true, deadline: '' });
      } else {
        alert(data.message || 'Failed to add requirement');
      }
    } catch (error) {
      alert('Server error while adding requirement');
    }
  };

  const resetUserForm = () => {
    setUserForm({ role: 'student', full_name: '', email: '', password: '', student_number: '', course: '', year_level: '', employee_id: '', department: '' });
    setUserFormError('');
    setShowAddUserPassword(false);
  };

  const addUser = async () => {
    if (!userForm.full_name || !userForm.email || !userForm.password) {
      setUserFormError('Full name, email, and password are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();

      if (!data.success) {
        setUserFormError(data.message || 'Unable to create user');
        return;
      }

      const created = data.data;
      const profile = created.profile || {};
      const createdUser = {
        user_id: created.user_id,
        email: created.email,
        role: created.role,
        status: created.status,
        requires_password_change: created.requires_password_change,
        created_at: created.created_at,
        details: profile
      };

      setUsers([...users, createdUser]);
      if (created.role === 'student') {
        setStudents([...students, profile]);
      } else if (created.role === 'staff') {
        setStaff([...staff, profile]);
      }

      setShowUserModal(false);
      resetUserForm();
    } catch (error) {
      setUserFormError('Server error while creating user.');
    }
  };

  const stats = {
    total_users: users.length,
    total_students: students.length,
    total_companies: companies.length,
    active_companies: companies.filter(c => c.status === 'active').length,
    ongoing_placements: mockData.ojt_placements.filter(p => p.status === 'ongoing').length,
    completed_placements: mockData.ojt_placements.filter(p => p.status === 'completed').length,
    total_hours: mockData.attendance.reduce((s, a) => s + (a.hours_rendered || 0), 0).toFixed(1)
  };

  const pages = {
    dashboard: <AdminOverview stats={stats} announcements={mockData.announcements} />,
    users: <ManageUsersView users={users} students={students} staff={staff} admins={mockData.admins} onAdd={() => setShowUserModal(true)} />,
    pending: <PendingAccountsView />,
    companies: <ManageCompaniesView companies={companies} onAdd={() => setShowCompanyModal(true)} setCompanies={setCompanies} />,
    requirements: <ManageRequirementsView reqTypes={reqTypes} onAdd={() => setShowReqModal(true)} setReqTypes={setReqTypes} />,
    reports: <ReportsView stats={stats} placements={mockData.ojt_placements} students={students} companies={companies} />,
    profile: <AdminProfileView currentUser={currentUser} />
  };

  return (
    <>
      {showCompanyModal && (
        <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header"><h2 className="modal-title">Add Partner Company</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowCompanyModal(false)}>✕</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={companyForm.company_name} onChange={e => setCompanyForm({ ...companyForm, company_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Industry</label><input className="form-input" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={companyForm.address} onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={companyForm.contact_person} onChange={e => setCompanyForm({ ...companyForm, contact_person: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Slots Available</label><input type="number" className="form-input" value={companyForm.slots_available} min="1" onChange={e => setCompanyForm({ ...companyForm, slots_available: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Photo URL</label><input type="text" className="form-input" placeholder="https://example.com/logo.png" value={companyForm.photo_url} onChange={e => setCompanyForm({ ...companyForm, photo_url: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Requirements</label><textarea className="form-input" placeholder="e.g. Resume, Transcript, Cover Letter" value={companyForm.requirements} onChange={e => setCompanyForm({ ...companyForm, requirements: e.target.value })} style={{ minHeight: '60px' }} /></div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={addCompany}><Plus size={16} /> Add Company</button>
          </div>
        </div>
      )}

      {showReqModal && (
        <div className="modal-overlay" onClick={() => setShowReqModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Add Requirement Type</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowReqModal(false)}>✕</button></div>
            <div className="form-group"><label className="form-label">Requirement Name</label><input className="form-input" value={reqForm.name} onChange={e => setReqForm({ ...reqForm, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={reqForm.description} onChange={e => setReqForm({ ...reqForm, description: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-input" value={reqForm.deadline} onChange={e => setReqForm({ ...reqForm, deadline: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Required?</label>
                <select className="form-select" value={reqForm.is_required} onChange={e => setReqForm({ ...reqForm, is_required: e.target.value === 'true' })}>
                  <option value="true">Yes (Required)</option><option value="false">No (Optional)</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={addRequirement}><Plus size={16} /> Add Requirement</button>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={() => { setShowUserModal(false); resetUserForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add New User</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowUserModal(false); resetUserForm(); }}>✕</button>
            </div>

            {userFormError && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem', background: 'rgba(244,63,94,0.1)', color: 'var(--status-rejected)' }}>
                {userFormError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select
                className="form-select"
                value={userForm.role}
                onChange={e => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={userForm.full_name} onChange={handleUserFullNameChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showAddUserPassword ? "text" : "password"} className="form-input" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowAddUserPassword(!showAddUserPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showAddUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {userForm.role === 'student' ? (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Student Number</label>
                  <input className="form-input" value={userForm.student_number} onChange={e => setUserForm({ ...userForm, student_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-input" value={userForm.course} onChange={e => setUserForm({ ...userForm, course: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year Level</label>
                  <input className="form-input" value={userForm.year_level} onChange={e => setUserForm({ ...userForm, year_level: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" value={userForm.employee_id} onChange={e => setUserForm({ ...userForm, employee_id: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })} />
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '4px 0 16px' }}>
              The temporary password is required to create the account.
            </p>

            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={addUser}>
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>
      )}

      <div className="page">{pages[activePage] || pages.dashboard}</div>
    </>
  );
}

function AdminOverview({ stats, announcements }) {
  return (
    <>
      <div className="page-header"><h1>Admin Dashboard</h1><p>System-wide overview and management tools</p></div>
      <div className="stat-grid">
        <div className="stat-card cyan animate-fade-in-up delay-100"><div className="stat-icon cyan"><Users size={20} /></div><div><div className="stat-value">{stats.total_users}</div><div className="stat-label">Total Users</div></div></div>
        <div className="stat-card purple animate-fade-in-up delay-200"><div className="stat-icon purple"><Building2 size={20} /></div><div><div className="stat-value">{stats.total_companies}</div><div className="stat-label">Partner Companies</div></div></div>
        <div className="stat-card green animate-fade-in-up delay-300"><div className="stat-icon green"><TrendingUp size={20} /></div><div><div className="stat-value">{stats.ongoing_placements}</div><div className="stat-label">Active Placements</div></div></div>
        <div className="stat-card orange animate-fade-in-up delay-400"><div className="stat-icon orange"><Clock size={20} /></div><div><div className="stat-value">{stats.total_hours}h</div><div className="stat-label">Hours Tracked</div></div></div>
      </div>
      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card animate-fade-in-up delay-300">
          <div className="card-header"><div className="card-title">Quick Stats</div></div>
          {[
            ['Students', stats.total_students],
            ['Active Companies', stats.active_companies],
            ['Ongoing Placements', stats.ongoing_placements],
            ['Completed Placements', stats.completed_placements]
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="card animate-fade-in-up delay-400">
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

function ManageUsersView({ users, students, staff, admins, onAdd }) {
  const [search, setSearch] = useState('');

  const enriched = users.map(u => {
    let profile = null;
    if (u.role === 'student') profile = students.find(s => s.user_id === u.user_id);
    else if (u.role === 'staff') profile = staff.find(s => s.user_id === u.user_id);
    else if (u.role === 'admin') profile = admins.find(a => a.user_id === u.user_id);
    return { ...u, full_name: profile?.full_name || u.email };
  });

  const filtered = enriched.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h1>Manage Users</h1><p>View all registered system users and their roles</p></div>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Add User</button>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '20px' }}>
        <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search name, email, or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '9px 13px 9px 36px',
            background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
            borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Registered</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td style={{ color: 'var(--text-muted)' }}>{u.user_id}</td>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ color: 'var(--text-accent)', fontSize: '0.82rem' }}>{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td><StatusBadge status={u.status} /></td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ManageCompaniesView({ companies, onAdd, setCompanies }) {
  const [search, setSearch] = useState('');
  const deactivate = async (id) => {
    const company = companies.find(c => c.company_id === id);
    const newStatus = company?.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(companies.map(c => c.company_id === id ? { ...c, status: newStatus } : c));
      } else {
        alert(data.message || 'Failed to update company status');
      }
    } catch (error) {
      alert('Server error while updating company status');
    }
  };

  const filtered = companies.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_person || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h1>Partner Companies</h1><p>Manage Host Training Establishment (HTE) directory</p></div>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Add Company</button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '20px' }}>
        <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search company, industry, or contact..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '9px 13px 9px 36px',
            background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
            borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
        )}
      </div>

      {search && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Company</th><th>Industry & Address</th><th>Contact & Requirements</th><th>Slots Needed</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(c => {
                const isFull = c.slots_available === 0;
                return (
                  <tr key={c.company_id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {c.photo_url ? (
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: `url(${c.photo_url}) center/cover` }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>{c.company_name[0]}</div>
                        )}
                        <div>
                          <div>{c.company_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-primary)' }}>{c.industry || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.address || '—'}</div>
                    </td>
                    <td>
                      <div>{c.contact_person || '—'} {c.contact_number ? `(${c.contact_number})` : ''}</div>
                      {c.requirements && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reqs: {c.requirements}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: isFull ? '#f43f5e' : 'var(--status-approved)' }}>
                          {c.slots_available}
                        </span>
                        {isFull && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)',
                            color: '#f43f5e', borderRadius: '5px', padding: '1px 6px',
                            fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase'
                          }}>
                            <AlertCircle size={10} /> Full
                          </span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><button className="btn btn-ghost btn-xs" onClick={() => deactivate(c.company_id)}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ManageRequirementsView({ reqTypes, onAdd, setReqTypes }) {
  const toggle = async (id) => {
    const req = reqTypes.find(r => r.requirement_id === id);
    const newIsRequired = !req?.is_required;
    try {
      const res = await fetch(`${API_BASE_URL}/requirements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_required: newIsRequired })
      });
      const data = await res.json();
      if (data.success) {
        setReqTypes(reqTypes.map(r => r.requirement_id === id ? { ...r, is_required: newIsRequired } : r));
      } else {
        alert(data.message || 'Failed to toggle requirement');
      }
    } catch (error) {
      alert('Server error while toggling requirement');
    }
  };
  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h1>Requirement Types</h1><p>Configure OJT document submission requirements</p></div>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Add Requirement</button>
        </div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Requirement Name</th><th>Description</th><th>Deadline</th><th>Required</th><th>Action</th></tr></thead>
            <tbody>
              {reqTypes.map(r => (
                <tr key={r.requirement_id}>
                  <td style={{ color: 'var(--text-muted)' }}>{r.requirement_id}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.description}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.deadline}</td>
                  <td><span className={`badge ${r.is_required ? 'badge-approved' : 'badge-pending'}`}><span className="badge-dot" />{r.is_required ? 'Required' : 'Optional'}</span></td>
                  <td><button className="btn btn-ghost btn-xs" onClick={() => toggle(r.requirement_id)}>Toggle</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ReportsView({ stats, placements, students, companies }) {
  return (
    <>
      <div className="page-header"><h1>System Reports & Analytics</h1><p>View overall OJT performance and completion analytics</p></div>
      <div className="stat-grid">
        <div className="stat-card cyan"><div className="stat-icon cyan"><BarChart3 size={20} /></div><div><div className="stat-value">{stats.total_students}</div><div className="stat-label">Total Students</div></div></div>
        <div className="stat-card green"><div className="stat-icon green"><CheckCircle2 size={20} /></div><div><div className="stat-value">{stats.completed_placements}</div><div className="stat-label">OJT Completed</div></div></div>
        <div className="stat-card purple"><div className="stat-icon purple"><TrendingUp size={20} /></div><div><div className="stat-value">{stats.ongoing_placements}</div><div className="stat-label">OJT Ongoing</div></div></div>
        <div className="stat-card orange"><div className="stat-icon orange"><Clock size={20} /></div><div><div className="stat-value">{stats.total_hours}h</div><div className="stat-label">Total Hours Tracked</div></div></div>
      </div>
      <div className="card animate-fade-in-up delay-200">
        <div className="card-header"><div className="card-title">Placement Summary</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Course</th><th>Company</th><th>Hours Rendered</th><th>Required</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              {placements.map(p => {
                const s = students.find(st => st.student_id === p.student_id);
                const c = companies.find(co => co.company_id === p.company_id);
                const pct = Math.min(Math.round((p.total_hours_rendered / p.required_hours) * 100), 100);
                return (
                  <tr key={p.placement_id}>
                    <td style={{ fontWeight: 600 }}>{s?.full_name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s?.course || '—'}</td>
                    <td>{c?.company_name || '—'}</td>
                    <td style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{p.total_hours_rendered}h</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.required_hours}h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--color-bg-elevated)', borderRadius: '999px', overflow: 'hidden', minWidth: '80px' }}>
                          <div style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: '999px', width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', width: '36px' }}>{pct}%</span>
                      </div>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PendingAccountsView() {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pending-accounts`);
      const data = await res.json();
      if (data.success) {
        setPendingAccounts(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const handleApprove = async (user_id) => {
    if (!window.confirm("Approve this account? An email will be sent to the user with their temporary password.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/approve-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPendingAccounts();
      } else {
        alert(data.message || 'Error approving account');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while approving account');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Pending Accounts</h1>
        <p>Review and approve new student accounts</p>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading pending accounts...</div>
          ) : pendingAccounts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>No pending accounts at this time.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Student No.</th>
                  <th>Gender</th>
                  <th>Course/Year</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingAccounts.map(u => (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 600 }}>{u.details?.full_name || 'N/A'}</td>
                    <td style={{ color: 'var(--text-accent)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.details?.student_number || 'N/A'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.details?.gender || 'N/A'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.details?.course} - {u.details?.year_level}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td>
                      <button className="btn btn-success btn-xs" onClick={() => handleApprove(u.user_id)}>
                        <CheckCircle2 size={12} /> Approve Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function AdminProfileView({ currentUser }) {
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
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
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
        setMsg({ type: 'success', text: 'Admin profile updated successfully!' });
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
        <p>Manage your administrator account settings</p>
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