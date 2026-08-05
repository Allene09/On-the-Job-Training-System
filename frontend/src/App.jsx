import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import API_BASE_URL from './config/api';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import StudentDashboard from './screens/Student/StudentDashboard';
import StaffDashboard from './screens/Staff/StaffDashboard';
import AdminDashboard from './screens/Admin/AdminDashboard';
import {
  LayoutDashboard, Users, Building2, Calendar, FileText,
  Settings, LogOut, Menu, X, Bell, ChevronRight, Activity, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_CONFIG = {
  student: [
    {
      group: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'requirements', label: 'Requirements', icon: FileText },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'attendance', label: 'Attendance / DTR', icon: Calendar },
        { id: 'reports', label: 'Weekly Reports', icon: FileText },
        { id: 'progress', label: 'Progress', icon: Activity }
      ]
    }
  ],
  staff: [
    {
      group: 'Management', items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profiling', label: 'Student Profiling', icon: Users },
        { id: 'requirements', label: 'Review Requirements', icon: FileText },
        { id: 'applications', label: 'Applications', icon: Building2 },
        { id: 'attendance', label: 'Attendance Monitor', icon: Calendar },
        { id: 'evaluations', label: 'Evaluations', icon: Activity }
      ]
    }
  ],
  admin: [
    {
      group: 'System', items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'companies', label: 'Partner Companies', icon: Building2 },
        { id: 'pending', label: 'Pending Accounts', icon: Database },
        { id: 'requirements', label: 'Requirements Config', icon: Settings },
        { id: 'reports', label: 'Reports & Analytics', icon: Activity }
      ]
    }
  ]
};

const PAGE_TITLES = {
  dashboard: 'Dashboard', requirements: 'Requirements', companies: 'Companies',
  attendance: 'Attendance / DTR', reports: 'Reports', progress: 'Progress & Evaluation',
  users: 'Manage Users', applications: 'Applications', evaluations: 'Evaluations',
  profiling: 'Student Profiling', pending: 'Pending Accounts', profile: 'My Profile'
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Sidebar({ navItems, activePage, setActivePage, currentUser, onLogout, open, setOpen }) {
  const profile = currentUser.profile;
  const displayName = profile?.full_name || currentUser.email;

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 90, display: open ? 'block' : 'none'
        }}
      />
      <motion.aside
        className="sidebar"
        style={{
          transform: open ? 'translateX(0)' : '',
          width: '260px',
          margin: '16px',
          height: 'calc(100vh - 32px)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
        initial={false}
        animate={{ x: open ? 0 : (window.innerWidth <= 768 ? -300 : 0) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Logo" />
          <span className="sidebar-logo-text">OJTrack</span>
        </div>

        <div className={`sidebar-role-badge role-${currentUser.role}`}>
          {currentUser.role.toUpperCase()}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div className="nav-group-label">{group.group}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => { setActivePage(item.id); setOpen(false); }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" onClick={() => { setActivePage('profile'); setOpen(false); }} style={{ cursor: 'pointer' }}>
            <div className="user-avatar">{initials(displayName)}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{displayName}</div>
              <div className="user-email" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.email}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              title="Sign out"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', flexShrink: 0 }}
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function AppShell() {
  const { currentUser, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/notifications?user_id=${currentUser.user_id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setUnreadNotifs(data.data.filter(n => !n.is_read));
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifs();
  }, [currentUser]);

  if (!currentUser) {
    if (showLogin) return <LoginScreen onBack={() => setShowLogin(false)} />;
    return <LandingScreen onGetStarted={() => setShowLogin(true)} />;
  }

  const navItems = NAV_CONFIG[currentUser.role] || [];

  const DashboardComponent = {
    student: StudentDashboard,
    staff: StaffDashboard,
    admin: AdminDashboard
  }[currentUser.role];

  return (
    <div className="app-container">
      <Sidebar
        navItems={navItems}
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={logout}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ display: 'none' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              id="hamburger-btn"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="topbar-title">{PAGE_TITLES[activePage] || 'Dashboard'}</span>
          </div>

          <div className="topbar-actions">
            <button className="notif-btn" title="Notifications" onClick={() => setActivePage('dashboard')}>
              <Bell size={18} />
              {unreadNotifs.length > 0 && <span className="notif-badge" />}
            </button>
          </div>
        </div>

        {/* Render role dashboard with AnimatePresence */}
        <div style={{ height: '100%', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ height: '100%' }}
            >
              {DashboardComponent && (
                <DashboardComponent activePage={activePage} setActivePage={setActivePage} currentUser={currentUser} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
