import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import API_BASE_URL, { fetchWithAuth } from '../../config/api';
import {
  Users, Building2, FileText, BarChart3, Plus, Settings,
  TrendingUp, Clock, CheckCircle2, XCircle, Bell, Search, AlertCircle, Eye, EyeOff, X,
  Copy, Check, Lock, Unlock, Shield, ShieldCheck, UserCheck, UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';

function StatusBadge({ status }) {
  const map = { active: 'badge-active', inactive: 'badge-rejected', pending: 'badge-pending', approved: 'badge-approved', student: 'badge-ongoing', staff: 'badge-submitted', admin: 'badge-approved' };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminDashboard({ activePage }) {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [reqTypes, setReqTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0, total_students: 0, total_companies: 0,
    active_companies: 0, ongoing_placements: 0, completed_placements: 0, total_hours: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [companyForm, setCompanyForm] = useState({ company_name: '', industry: '', address: '', contact_person: '', contact_number: '', email: '', slots_available: 5, photo_url: '', requirements: '' });
  const [companyPhotoFile, setCompanyPhotoFile] = useState(null);
  const [editCompanyForm, setEditCompanyForm] = useState(null);
  const [editCompanyPhotoFile, setEditCompanyPhotoFile] = useState(null);
  const [reqForm, setReqForm] = useState({ name: '', description: '', is_required: true, deadline: '' });
  
  const generateIdForRole = (role) => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return role === 'staff' ? `EMP-${year}-${random}` : `${year}-${random}`;
  };

  const [userForm, setUserForm] = useState({
    role: 'student',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    student_number: generateIdForRole('student'),
    course: '',
    year_level: '',
    gender: '',
    contact_number: '',
    address: '',
    employee_id: generateIdForRole('staff'),
    department: ''
  });
  const [userFormError, setUserFormError] = useState('');
  const [newlyCreatedAccount, setNewlyCreatedAccount] = useState(null);

  const handleNameChange = (field, value) => {
    const updatedForm = { ...userForm, [field]: value };
    const first = updatedForm.first_name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const last = updatedForm.last_name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const domain = updatedForm.role === 'staff' ? '@staff.edu.ph' : '@bisu.edu.ph';
    const autoGenEmail = first && last ? `${first}${last}${domain}` : '';
    const autoGenPass = first && last ? `${first}${last}123` : '';

    setUserForm({ 
      ...updatedForm, 
      email: autoGenEmail, 
      password: autoGenPass 
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersRes, compsRes, reqsRes, annRes, statsRes, placementsRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/admin/users`),
          fetchWithAuth(`${API_BASE_URL}/companies`),
          fetchWithAuth(`${API_BASE_URL}/requirements/types`),
          fetchWithAuth(`${API_BASE_URL}/admin/announcements`),
          fetchWithAuth(`${API_BASE_URL}/admin/stats`),
          fetchWithAuth(`${API_BASE_URL}/admin/placements`)
        ]);

        if (!isMounted) return;

        const usersData = await usersRes.json();
        const compsData = await compsRes.json();
        const reqsData = await reqsRes.json();
        const annData = await annRes.json();
        const statsData = await statsRes.json();
        const placementsData = await placementsRes.json();

        const allUsers = usersData.data || [];
        setUsers(allUsers);
        setStudents(allUsers.filter(u => u.role === 'student'));
        setStaff(allUsers.filter(u => u.role === 'staff'));
        setAdmins(allUsers.filter(u => u.role === 'admin'));
        setCompanies(compsData.data || []);
        setReqTypes(reqsData.data || []);
        setAnnouncements(annData.data || []);
        setPlacements(placementsData.data || []);
        
        // Since backend doesn't have an endpoint for all placements in admin, we mock the stats or fetch them if added.
        // For now, let's use the provided stats from backend.
        setStats({
          total_users: allUsers.length,
          total_students: allUsers.filter(u => u.role === 'student').length,
          total_companies: (compsData.data || []).length,
          active_companies: (compsData.data || []).filter(c => c.status === 'active').length,
          ongoing_placements: statsData.data?.active_placements || 0,
          completed_placements: 0, // Fallback if missing
          total_hours: 0 // Fallback if missing
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchAdminData();
    return () => { isMounted = false; };
  }, []);

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/companies/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        return data.photo_url;
      }
      return null;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };

  const addCompany = async () => {
    if (!companyForm.company_name) return;
    try {
      let finalPhotoUrl = companyForm.photo_url;
      if (companyPhotoFile) {
        const uploadedUrl = await uploadPhoto(companyPhotoFile);
        if (uploadedUrl) finalPhotoUrl = uploadedUrl;
      }

      const res = await fetchWithAuth(`${API_BASE_URL}/companies`, {
        method: 'POST',
        body: JSON.stringify({ ...companyForm, photo_url: finalPhotoUrl, added_by: currentUser?.user_id || 1 })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies([...companies, { ...companyForm, photo_url: finalPhotoUrl, company_id: data.data.company_id, status: 'active', added_by: currentUser?.user_id || 1, created_at: new Date().toISOString(), slots_available: parseInt(companyForm.slots_available) }]);
        setShowCompanyModal(false);
        setCompanyForm({ company_name: '', industry: '', address: '', contact_person: '', contact_number: '', email: '', slots_available: 5, photo_url: '', requirements: '' });
        setCompanyPhotoFile(null);
        toast.success('Company added successfully!');
      } else {
        toast.error(data.message || 'Failed to add company');
      }
    } catch (error) {
      toast.error('Server error while adding company');
    }
  };

  const updateCompany = async () => {
    if (!editCompanyForm || !editCompanyForm.company_name) return;
    try {
      let finalPhotoUrl = editCompanyForm.photo_url;
      if (editCompanyPhotoFile) {
        const uploadedUrl = await uploadPhoto(editCompanyPhotoFile);
        if (uploadedUrl) finalPhotoUrl = uploadedUrl;
      }

      const res = await fetchWithAuth(`${API_BASE_URL}/companies/${editCompanyForm.company_id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...editCompanyForm, photo_url: finalPhotoUrl })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(companies.map(c => c.company_id === editCompanyForm.company_id ? { ...editCompanyForm, photo_url: finalPhotoUrl } : c));
        setShowEditCompanyModal(false);
        setEditCompanyForm(null);
        setEditCompanyPhotoFile(null);
        toast.success('Company updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update company');
      }
    } catch (error) {
      toast.error('Server error while updating company');
    }
  };

  const addRequirement = async () => {
    if (!reqForm.name) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/requirements/type`, {
        method: 'POST',
        body: JSON.stringify(reqForm)
      });
      const data = await res.json();
      if (data.success) {
        setReqTypes([...reqTypes, data.data]);
        setShowReqModal(false);
        setReqForm({ name: '', description: '', is_required: true, deadline: '' });
        toast.success('Requirement added successfully!');
      } else {
        toast.error(data.message || 'Failed to add requirement');
      }
    } catch (error) {
      toast.error('Server error while adding requirement');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      role: 'student',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      password: '',
      student_number: generateIdForRole('student'),
      course: '',
      year_level: '',
      gender: '',
      contact_number: '',
      address: '',
      employee_id: generateIdForRole('staff'),
      department: ''
    });
    setUserFormError('');
  };

  const addUser = async () => {
    if (!userForm.first_name || !userForm.last_name || !userForm.email || !userForm.password) {
      setUserFormError('First name, last name, and auto-generated fields are required.');
      return;
    }

    if (userForm.contact_number && userForm.contact_number.length !== 11) {
      setUserFormError('Contact number must be exactly 11 digits (e.g. 09123456789)');
      return;
    }

    const payload = {
      ...userForm,
      full_name: `${userForm.first_name} ${userForm.middle_name} ${userForm.last_name}`.replace(/\s+/g, ' ').trim()
    };

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.success) {
        setUserFormError(data.message || 'Unable to create user');
        toast.error(data.message || 'Unable to create user');
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
        full_name: payload.full_name,
        first_name: payload.first_name,
        middle_name: payload.middle_name,
        last_name: payload.last_name,
        student_number: payload.student_number || profile.student_number || '',
        employee_id: payload.employee_id || profile.employee_id || '',
        course: payload.course || profile.course || '',
        year_level: payload.year_level || profile.year_level || '',
        gender: payload.gender || profile.gender || '',
        contact_number: payload.contact_number || profile.contact_number || '',
        address: payload.address || profile.address || '',
        department: payload.department || profile.department || '',
        plain_password: userForm.password,
        details: { ...profile, ...payload }
      };

      setUsers(prev => [createdUser, ...prev]);
      if (created.role === 'student') {
        setStudents(prev => [{ ...profile, ...payload }, ...prev]);
      } else if (created.role === 'staff') {
        setStaff(prev => [{ ...profile, ...payload }, ...prev]);
      }

      setShowUserModal(false);
      setNewlyCreatedAccount({ email: userForm.email, password: userForm.password, full_name: payload.full_name });
      resetUserForm();
      toast.success('User created successfully!');
    } catch (error) {
      setUserFormError('Server error while creating user.');
      toast.error('Server error while creating user.');
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
    dashboard: <AdminOverview stats={stats} announcements={announcements} />,
    users: <ManageUsersView users={users} setUsers={setUsers} students={students} staff={staff} admins={admins} onAdd={() => setShowUserModal(true)} />,
    pending: <PendingAccountsView />,
    companies: <ManageCompaniesView companies={companies} onAdd={() => setShowCompanyModal(true)} setCompanies={setCompanies} onEdit={(c) => { setEditCompanyForm(c); setShowEditCompanyModal(true); }} />,
    requirements: <ManageRequirementsView reqTypes={reqTypes} onAdd={() => setShowReqModal(true)} setReqTypes={setReqTypes} />,
    reports: <ReportsView stats={stats} placements={placements} students={students} companies={companies} />,
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
              <div className="form-group"><label className="form-label">Contact Number</label><input type="tel" inputMode="numeric" maxLength={11} className="form-input" placeholder="e.g. 09123456789" value={companyForm.contact_number} onChange={e => setCompanyForm({ ...companyForm, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })} /></div>
              <div className="form-group"><label className="form-label">Slots Available</label><input type="number" className="form-input" value={companyForm.slots_available} min="1" onChange={e => setCompanyForm({ ...companyForm, slots_available: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Photo Upload</label><input type="file" accept="image/*" className="form-input" onChange={e => {
              const file = e.target.files[0];
              if (file) setCompanyPhotoFile(file);
            }} /></div>
            <div className="form-group"><label className="form-label">Requirements</label><textarea className="form-input" placeholder="e.g. Resume, Transcript, Cover Letter" value={companyForm.requirements} onChange={e => setCompanyForm({ ...companyForm, requirements: e.target.value })} style={{ minHeight: '60px' }} /></div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={addCompany}><Plus size={16} /> Add Company</button>
          </div>
        </div>
      )}

      {showEditCompanyModal && editCompanyForm && (
        <div className="modal-overlay" onClick={() => setShowEditCompanyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header"><h2 className="modal-title">Edit Partner Company</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowEditCompanyModal(false)}>✕</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={editCompanyForm.company_name} onChange={e => setEditCompanyForm({ ...editCompanyForm, company_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Industry</label><input className="form-input" value={editCompanyForm.industry} onChange={e => setEditCompanyForm({ ...editCompanyForm, industry: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={editCompanyForm.address} onChange={e => setEditCompanyForm({ ...editCompanyForm, address: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={editCompanyForm.contact_person} onChange={e => setEditCompanyForm({ ...editCompanyForm, contact_person: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Contact Number</label><input type="tel" inputMode="numeric" maxLength={11} className="form-input" placeholder="e.g. 09123456789" value={editCompanyForm.contact_number} onChange={e => setEditCompanyForm({ ...editCompanyForm, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })} /></div>
              <div className="form-group"><label className="form-label">Slots Available</label><input type="number" className="form-input" value={editCompanyForm.slots_available} min="1" onChange={e => setEditCompanyForm({ ...editCompanyForm, slots_available: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={editCompanyForm.email} onChange={e => setEditCompanyForm({ ...editCompanyForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Photo Upload</label>
              {editCompanyForm.photo_url && !editCompanyPhotoFile && <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current photo: {editCompanyForm.photo_url.split('/').pop()}</div>}
              <input type="file" accept="image/*" className="form-input" onChange={e => {
              const file = e.target.files[0];
              if (file) setEditCompanyPhotoFile(file);
            }} /></div>
            <div className="form-group"><label className="form-label">Requirements</label><textarea className="form-input" placeholder="e.g. Resume, Transcript, Cover Letter" value={editCompanyForm.requirements} onChange={e => setEditCompanyForm({ ...editCompanyForm, requirements: e.target.value })} style={{ minHeight: '60px' }} /></div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={updateCompany}>Save Changes</button>
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
                onChange={e => {
                  const newRole = e.target.value;
                  const first = userForm.first_name.replace(/[^a-zA-Z]/g, '').toLowerCase();
                  const last = userForm.last_name.replace(/[^a-zA-Z]/g, '').toLowerCase();
                  const domain = newRole === 'staff' ? '@staff.edu.ph' : '@bisu.edu.ph';
                  const autoGenEmail = first && last ? `${first}${last}${domain}` : '';
                  const autoGenPass = first && last ? `${first}${last}123` : '';
                  
                  const idField = newRole === 'staff' ? 'employee_id' : 'student_number';
                  
                  setUserForm({ 
                    ...userForm, 
                    role: newRole, 
                    email: autoGenEmail, 
                    password: autoGenPass,
                    [idField]: userForm[idField] || generateIdForRole(newRole)
                  });
                }}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            {userForm.role === 'student' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Student ID Number</label>
                  <input className="form-input" required readOnly value={userForm.student_number} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" required value={userForm.last_name} onChange={e => handleNameChange('last_name', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Middle Name</label>
                    <input className="form-input" value={userForm.middle_name} onChange={e => handleNameChange('middle_name', e.target.value)} placeholder="e.g. Santos" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={userForm.first_name} onChange={e => handleNameChange('first_name', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-input" placeholder="e.g. BS Computer Science" value={userForm.course} onChange={e => setUserForm({ ...userForm, course: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year and Section</label>
                  <input className="form-input" value={userForm.year_level} onChange={e => setUserForm({ ...userForm, year_level: e.target.value })} placeholder="e.g. 4th Year - Section A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" required value={userForm.gender} onChange={e => setUserForm({ ...userForm, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                      value={userForm.contact_number}
                      onChange={e => setUserForm({ ...userForm, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Address</label>
                    <input className="form-input" placeholder="e.g. Tagbilaran City, Bohol" value={userForm.address} onChange={e => setUserForm({ ...userForm, address: e.target.value })} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" required readOnly value={userForm.employee_id} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" required value={userForm.last_name} onChange={e => handleNameChange('last_name', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Middle Name</label>
                    <input className="form-input" value={userForm.middle_name} onChange={e => handleNameChange('middle_name', e.target.value)} placeholder="e.g. Santos" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={userForm.first_name} onChange={e => handleNameChange('first_name', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Department</label>
                    <input className="form-input" placeholder="e.g. College of Technology" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      className="form-input"
                      placeholder="e.g. 09123456789"
                      value={userForm.contact_number}
                      onChange={e => setUserForm({ ...userForm, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address (Auto-generated)</label>
              <input type="email" className="form-input" required readOnly value={userForm.email} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
            </div>

            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={addUser}>
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>
      )}

      {newlyCreatedAccount && (
        <div className="modal-overlay" onClick={() => setNewlyCreatedAccount(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>User Created!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              The account for <strong>{newlyCreatedAccount.full_name}</strong> has been created. Please share these login details securely.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', userSelect: 'all' }}>{newlyCreatedAccount.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Generated Password</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--status-approved)', userSelect: 'all' }}>{newlyCreatedAccount.password}</div>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={() => setNewlyCreatedAccount(null)} style={{ justifyContent: 'center' }}>
              Done
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
      <div className="bento-grid">
        <motion.div className="bento-card col-span-3 stat-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon cyan"><Users size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.total_users}</div><div className="stat-label">Total Users</div></div>
        </motion.div>
        <motion.div className="bento-card col-span-3 stat-card purple" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon purple"><Building2 size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.total_companies}</div><div className="stat-label">Partner Companies</div></div>
        </motion.div>
        <motion.div className="bento-card col-span-3 stat-card green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon green"><TrendingUp size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.ongoing_placements}</div><div className="stat-label">Active Placements</div></div>
        </motion.div>
        <motion.div className="bento-card col-span-3 stat-card orange" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="stat-icon orange"><Clock size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.total_hours}h</div><div className="stat-label">Hours Tracked</div></div>
        </motion.div>

        <motion.div className="bento-card col-span-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <div className="card-header"><div className="card-title">Quick Stats</div></div>
          {[
            ['Students', stats.total_students],
            ['Active Companies', stats.active_companies],
            ['Ongoing Placements', stats.ongoing_placements],
            ['Completed Placements', stats.completed_placements]
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{val}</span>
            </div>
          ))}
        </motion.div>
        
        <motion.div className="bento-card col-span-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <div className="card-header"><div className="card-title">Announcements</div></div>
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
      </div>
    </>
  );
}

function ManageUsersView({ users, setUsers, students, staff, admins, onAdd }) {
  const [search, setSearch] = useState('');
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [showModalPass, setShowModalPass] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const enriched = users.map(u => {
    const profile = (u.role === 'student' ? students?.find(s => s.user_id === u.user_id) : u.role === 'staff' ? staff?.find(s => s.user_id === u.user_id) : admins?.find(a => a.user_id === u.user_id)) || u.details || {};
    
    const firstName = u.first_name || profile.first_name || u.details?.first_name || '';
    const middleName = u.middle_name || profile.middle_name || u.details?.middle_name || '';
    const lastName = u.last_name || profile.last_name || u.details?.last_name || '';
    const fullName = u.full_name || profile.full_name || u.details?.full_name || [firstName, middleName, lastName].filter(Boolean).join(' ') || u.email;
    const studentNumber = u.student_number || profile.student_number || u.details?.student_number || '';
    const gender = u.gender || profile.gender || u.details?.gender || '';
    const course = u.course || profile.course || u.details?.course || '';
    const yearLevel = u.year_level || u.year_section || profile.year_level || profile.year_section || u.details?.year_level || '';
    const contactNumber = u.contact_number || profile.contact_number || u.details?.contact_number || '';
    const address = u.address || profile.address || u.details?.address || '';
    const employeeId = u.employee_id || profile.employee_id || u.details?.employee_id || '';
    const department = u.department || profile.department || u.details?.department || '';

    return {
      ...u,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      full_name: fullName,
      student_number: studentNumber,
      gender: gender,
      course: course,
      year_level: yearLevel,
      contact_number: contactNumber,
      address: address,
      employee_id: employeeId,
      department: department,
      details: {
        ...u.details,
        ...profile,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        full_name: fullName,
        student_number: studentNumber,
        gender: gender,
        course: course,
        year_level: yearLevel,
        contact_number: contactNumber,
        address: address,
        employee_id: employeeId,
        department: department
      }
    };
  });

  const filtered = enriched.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.student_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.employee_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleUserStatus = async (userId, targetStatus) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.user_id === userId ? { ...u, status: targetStatus } : u));
        if (selectedUserForView && selectedUserForView.user_id === userId) {
          setSelectedUserForView(prev => ({ ...prev, status: targetStatus }));
        }
        toast.success(`User account marked as ${targetStatus}`);
      } else {
        toast.error(data.message || 'Failed to update user status');
      }
    } catch (error) {
      toast.error('Server error while updating user status');
    }
  };

  const handleCopyPassword = (pwd) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopiedPass(true);
    toast.success('Password copied to clipboard!');
    setTimeout(() => setCopiedPass(false), 2500);
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h1>Manage Users</h1><p>View registered system users, inspect profiles, and manage access</p></div>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Add User</button>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '20px' }}>
        <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search name, email, role, or ID..."
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
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td style={{ color: 'var(--text-muted)' }}>{u.user_id}</td>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: u.role === 'admin' ? 'rgba(16,185,129,0.15)' : u.role === 'staff' ? 'rgba(168,85,247,0.15)' : 'rgba(56,189,248,0.15)',
                        color: u.role === 'admin' ? '#10b981' : u.role === 'staff' ? '#a855f7' : '#38bdf8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                      </div>
                      <span>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-accent)', fontSize: '0.82rem' }}>{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td><StatusBadge status={u.status} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* View Profiling Button (Read-Only) */}
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => { setSelectedUserForView(u); setShowModalPass(false); setCopiedPass(false); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="View User Profiling"
                      >
                        <Eye size={13} /> View
                      </button>

                      {/* Active / Inactive Status Buttons */}
                      {u.status === 'active' ? (
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => toggleUserStatus(u.user_id, 'inactive')}
                          style={{ color: '#f43f5e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Deactivate this account"
                        >
                          <XCircle size={13} /> Inactive
                        </button>
                      ) : (
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => toggleUserStatus(u.user_id, 'active')}
                          style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Activate this account"
                        >
                          <CheckCircle2 size={13} /> Active
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-Only User Profiling Modal */}
      {selectedUserForView && (
        <div className="modal-overlay" onClick={() => setSelectedUserForView(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--primary-color)" /> User Profiling (Read-Only)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Review profile and account credentials for {selectedUserForView.full_name}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUserForView(null)}>✕</button>
            </div>

            {/* User Profile Header Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '16px', margin: '16px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: selectedUserForView.role === 'admin' ? 'rgba(16,185,129,0.2)' : selectedUserForView.role === 'staff' ? 'rgba(168,85,247,0.2)' : 'rgba(56,189,248,0.2)',
                  color: selectedUserForView.role === 'admin' ? '#10b981' : selectedUserForView.role === 'staff' ? '#a855f7' : '#38bdf8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800
                }}>
                  {selectedUserForView.full_name ? selectedUserForView.full_name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUserForView.full_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedUserForView.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <StatusBadge status={selectedUserForView.role} />
                <StatusBadge status={selectedUserForView.status} />
              </div>
            </div>

            {/* Password Section with Visibility Rule */}
            <div style={{
              background: selectedUserForView.status === 'active' ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
              border: `1px solid ${selectedUserForView.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
              borderRadius: '12px', padding: '16px', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.88rem', color: selectedUserForView.status === 'active' ? '#10b981' : '#f43f5e' }}>
                  {selectedUserForView.status === 'active' ? <Unlock size={16} /> : <Lock size={16} />}
                  Account Password Status
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedUserForView.status === 'active' ? '#10b981' : 'var(--text-muted)' }}>
                  {selectedUserForView.status === 'active' ? 'Account Approved' : 'Pending Approval / Inactive'}
                </span>
              </div>

              {selectedUserForView.status === 'active' ? (
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showModalPass ? 'text' : 'password'}
                        className="form-input"
                        readOnly
                        value={selectedUserForView.plain_password || '••••••••'}
                        style={{
                          background: 'rgba(0,0,0,0.25)',
                          fontFamily: showModalPass ? 'inherit' : 'monospace',
                          fontSize: '1rem',
                          letterSpacing: showModalPass ? 'normal' : '2px',
                          color: '#10b981',
                          fontWeight: 700,
                          paddingRight: '40px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPass(!showModalPass)}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                        }}
                        title={showModalPass ? 'Hide password' : 'Show password'}
                      >
                        {showModalPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {selectedUserForView.plain_password && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCopyPassword(selectedUserForView.plain_password)}
                        style={{ background: 'rgba(255,255,255,0.06)', gap: '4px', height: '40px', padding: '0 12px' }}
                        title="Copy password"
                      >
                        {copiedPass ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span style={{ fontSize: '0.8rem' }}>{copiedPass ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                    ✓ This account is approved. The password is visible to administrators.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '10px 0' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)',
                    fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Lock size={15} color="#f43f5e" />
                    <span>Password is hidden and will only become visible once the account is officially approved.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Profiling Fields (Read-Only) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                Personal Information
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Last Name</label>
                  <input className="form-input" readOnly value={selectedUserForView.last_name || selectedUserForView.details?.last_name || '—'} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Middle Name</label>
                  <input className="form-input" readOnly value={selectedUserForView.middle_name || selectedUserForView.details?.middle_name || '—'} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>First Name</label>
                  <input className="form-input" readOnly value={selectedUserForView.first_name || selectedUserForView.details?.first_name || '—'} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Full Name</label>
                  <input className="form-input" readOnly value={selectedUserForView.full_name || '—'} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Email Address</label>
                  <input className="form-input" readOnly value={selectedUserForView.email || '—'} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-accent)' }} />
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginTop: '6px' }}>
                {selectedUserForView.role.toUpperCase()} Profiling Details
              </div>

              {selectedUserForView.role === 'student' && (
                <>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Student ID Number</label>
                      <input className="form-input" readOnly value={selectedUserForView.student_number || selectedUserForView.details?.student_number || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Gender</label>
                      <input className="form-input" readOnly value={selectedUserForView.gender || selectedUserForView.details?.gender || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Course</label>
                      <input className="form-input" readOnly value={selectedUserForView.course || selectedUserForView.details?.course || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Year and Section</label>
                      <input className="form-input" readOnly value={selectedUserForView.year_level || selectedUserForView.details?.year_level || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Contact Number</label>
                      <input className="form-input" readOnly value={selectedUserForView.contact_number || selectedUserForView.details?.contact_number || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Address</label>
                      <input className="form-input" readOnly value={selectedUserForView.address || selectedUserForView.details?.address || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                  </div>
                </>
              )}

              {selectedUserForView.role === 'staff' && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Employee ID</label>
                    <input className="form-input" readOnly value={selectedUserForView.employee_id || selectedUserForView.details?.employee_id || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Department</label>
                    <input className="form-input" readOnly value={selectedUserForView.department || selectedUserForView.details?.department || '—'} style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                </div>
              )}

              {selectedUserForView.role === 'admin' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Access Privileges</label>
                  <input className="form-input" readOnly value="Full System Administrator Access" style={{ background: 'rgba(255,255,255,0.04)', color: '#10b981', fontWeight: 600 }} />
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedUserForView.status === 'active' ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleUserStatus(selectedUserForView.user_id, 'inactive')}
                    style={{ color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', gap: '6px' }}
                  >
                    <XCircle size={15} /> Deactivate Account
                  </button>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleUserStatus(selectedUserForView.user_id, 'active')}
                    style={{ color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', gap: '6px' }}
                  >
                    <CheckCircle2 size={15} /> Activate Account
                  </button>
                )}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedUserForView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ManageCompaniesView({ companies, onAdd, setCompanies, onEdit }) {
  const [search, setSearch] = useState('');
  const deactivate = async (id) => {
    const company = companies.find(c => c.company_id === id);
    const newStatus = company?.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/companies/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(companies.map(c => c.company_id === id ? { ...c, status: newStatus } : c));
        toast.success(`Company status updated to ${newStatus}`);
      } else {
        toast.error(data.message || 'Failed to update company status');
      }
    } catch (error) {
      toast.error('Server error while updating company status');
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
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: `url(${API_BASE_URL.replace('/api', '')}${c.photo_url}) center/cover` }} />
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
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => onEdit(c)}>Edit Details</button>
                        <button className="btn btn-ghost btn-xs" onClick={() => deactivate(c.company_id)}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    </td>
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
      const res = await fetchWithAuth(`${API_BASE_URL}/requirements/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_required: newIsRequired })
      });
      const data = await res.json();
      if (data.success) {
        setReqTypes(reqTypes.map(r => r.requirement_id === id ? { ...r, is_required: newIsRequired } : r));
        toast.success(`Requirement marked as ${newIsRequired ? 'Required' : 'Optional'}`);
      } else {
        toast.error(data.message || 'Failed to toggle requirement');
      }
    } catch (error) {
      toast.error('Server error while toggling requirement');
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/reports/graphical-stats?year=${selectedYear}`);
        const data = await res.json();
        if (data.success) {
          setGraphData(data.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchGraphData();
  }, [selectedYear]);

  const currentY = new Date().getFullYear();
  const years = Array.from({length: (currentY + 2) - 2024}, (_, i) => 2024 + i);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>System Reports & Analytics</h1>
          <p>View overall OJT performance and completion analytics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Year:</span>
          <select className="form-input" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ padding: '6px 12px', width: 'auto' }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card cyan"><div className="stat-icon cyan"><BarChart3 size={20} /></div><div><div className="stat-value">{stats.total_students}</div><div className="stat-label">Total Students</div></div></div>
        <div className="stat-card green"><div className="stat-icon green"><CheckCircle2 size={20} /></div><div><div className="stat-value">{stats.completed_placements}</div><div className="stat-label">OJT Completed</div></div></div>
        <div className="stat-card purple"><div className="stat-icon purple"><TrendingUp size={20} /></div><div><div className="stat-value">{stats.ongoing_placements}</div><div className="stat-label">OJT Ongoing</div></div></div>
        <div className="stat-card orange"><div className="stat-icon orange"><Clock size={20} /></div><div><div className="stat-value">{stats.total_hours}h</div><div className="stat-label">Total Hours Tracked</div></div></div>
      </div>

      <div className="card animate-fade-in-up delay-100" style={{ marginBottom: '24px' }}>
        <div className="card-header"><div className="card-title">Monthly Activity Overview ({selectedYear})</div></div>
        <div style={{ padding: '20px', height: '400px', width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>Loading graph data...</div>
          ) : graphData.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available for this year</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-purple)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--color-purple)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month_name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar yAxisId="left" dataKey="registrations" name="New Users" fill="url(#colorUsers)" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="placements" name="Placements Started" fill="url(#colorPlacements)" radius={[6, 6, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="hours_tracked" name="Hours Tracked" stroke="var(--color-orange)" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: 'var(--color-bg-elevated)' }} activeDot={{ r: 8, stroke: 'var(--color-orange)', strokeWidth: 2, fill: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
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
  const [approvedAccountInfo, setApprovedAccountInfo] = useState(null);

  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/pending-accounts`);
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
    if (!window.confirm("Approve this account? An email will be sent to the user with their generated password.")) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/approve-account`, {
        method: 'POST',
        body: JSON.stringify({ user_id })
      });
      const data = await res.json();
      if (data.success) {
        setApprovedAccountInfo({
          email: pendingAccounts.find(u => u.user_id === user_id)?.email,
          password: data.generatedPassword
        });
        toast.success('Account approved successfully');
        fetchPendingAccounts();
      } else {
        toast.error(data.message || 'Error approving account');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error while approving account');
    }
  };

  const handleReject = async (user_id) => {
    if (!window.confirm("Are you sure you want to reject this account?")) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/reject-account`, {
        method: 'POST',
        body: JSON.stringify({ user_id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Account rejected');
        fetchPendingAccounts();
      } else {
        toast.error(data.message || 'Error rejecting account');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error while rejecting account');
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="btn btn-success btn-xs" onClick={() => handleApprove(u.user_id)}>
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button className="btn btn-ghost btn-xs" onClick={() => handleReject(u.user_id)} style={{ color: '#f43f5e' }}>
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {approvedAccountInfo && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Account Approved</h2>
              <button className="icon-btn" onClick={() => setApprovedAccountInfo(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                  The account has been approved. Please share these credentials with the student:
                </p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.9rem' }}>Email</span>
                    <strong style={{ fontSize: '1.1rem' }}>{approvedAccountInfo.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.9rem' }}>Password</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{approvedAccountInfo.password}</strong>
                  </div>
                </div>
                <button className="btn btn-primary w-full" onClick={() => setApprovedAccountInfo(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AdminProfileView({ currentUser }) {
  const [formData, setFormData] = useState({
    first_name: currentUser?.profile?.first_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ')[0] : ''),
    middle_name: currentUser?.profile?.middle_name || '',
    last_name: currentUser?.profile?.last_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ').slice(1).join(' ') : ''),
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
      first_name: currentUser?.profile?.first_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ')[0] : ''),
      middle_name: currentUser?.profile?.middle_name || '',
      last_name: currentUser?.profile?.last_name || (currentUser?.profile?.full_name ? currentUser.profile.full_name.split(' ').slice(1).join(' ') : ''),
      email: currentUser?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  }, [currentUser]);

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
          current_password: formData.current_password,
          password: formData.new_password,
          confirm_password: formData.confirm_password,
          full_name: [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ').trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        updateCurrentUser(data.user);
        setMsg({ type: 'success', text: 'Admin profile updated successfully!' });
        toast.success('Admin profile updated successfully!');
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

  const displayName = [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' ') || currentUser?.profile?.full_name || 'Admin';

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal profile and account credentials</p>
      </div>

      <div style={{ maxWidth: '640px' }}>
        {/* Profile Card Header */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
          borderRadius: '16px', padding: '20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800
          }}>
            {displayName[0] ? displayName[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{currentUser?.email}</div>
            <div style={{ marginTop: '8px' }}>
              <span className="badge badge-approved"><span className="badge-dot" /> Administrator</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
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