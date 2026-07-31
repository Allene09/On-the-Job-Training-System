import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import StudentDashboard from './screens/Student/StudentDashboard';
import StaffDashboard from './screens/Staff/StaffDashboard';
import AdminDashboard from './screens/Admin/AdminDashboard';
import {
  LayoutDashboard, FileText, Building2, Clock, BookOpen,
  TrendingUp, Bell, Star, Users, BarChart3, Settings,
  FileCheck, Briefcase, ClipboardList, LogOut, Menu, X
} from 'lucide-react';

const NAV_CONFIG = {
  student: [
    { id: 'dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
    { id: 'requirements', label: 'Requirements',       icon: FileText },
    { id: 'companies',    label: 'Companies',          icon: Building2 },
    { id: 'attendance',   label: 'Attendance / DTR',   icon: Clock },
    { id: 'reports',      label: 'Weekly Reports',     icon: BookOpen },
    { id: 'progress',     label: 'Progress',           icon: TrendingUp }
  ],
  staff: [
    { id: 'dashboard',    label: 'Dashboard',          icon: LayoutDashboard },
    { id: 'profiling',    label: 'Student Profiling',  icon: Users },
    { id: 'requirements', label: 'Review Requirements',icon: FileCheck },
    { id: 'applications', label: 'Applications',       icon: Briefcase },
    { id: 'attendance',   label: 'Attendance Monitor', icon: Clock },
    { id: 'evaluations',  label: 'Evaluations',        icon: Star }
  ],
  admin: [
    { id: 'dashboard',    label: 'Dashboard',          icon: LayoutDashboard },
    { id: 'users',        label: 'Manage Users',       icon: Users },
    { id: 'companies',    label: 'Partner Companies',  icon: Building2 },
    { id: 'pending',      label: 'Pending Accounts',   icon: Users },
    { id: 'requirements', label: 'Requirements Config',icon: Settings },
    { id: 'reports',      label: 'Reports & Analytics',icon: BarChart3 }
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
      {/* Mobile overlay */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside className="sidebar" style={{ transform: open ? 'translateX(0)' : undefined }}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="OJTrack" />
          <span className="sidebar-logo-text">OJTrack</span>
        </div>

        {/* Role badge */}
        <div className={`sidebar-role-badge role-${currentUser.role}`}>
          {currentUser.role === 'student' ? '🎓 Student' : currentUser.role === 'staff' ? '🛡️ Coordinator' : '⚙️ Administrator'}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">Navigation</div>
          {navItems.map((item, i) => (
            <button
              key={item.id}
              className={`nav-item animate-slide-in-left delay-${(i + 1) * 100} ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { setActivePage(item.id); setOpen(false); }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer" style={{ cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => { setActivePage('profile'); setOpen(false); }}>
          <div className="user-info">
            <div className="user-avatar">{initials(displayName)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              title="Sign out"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', flexShrink: 0 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function AppShell() {
  const { currentUser, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!currentUser) {
    if (showLogin) return <LoginScreen onBack={() => setShowLogin(false)} />;
    return <LandingScreen onGetStarted={() => setShowLogin(true)} />;
  }

  const navItems = NAV_CONFIG[currentUser.role] || [];

  const DashboardComponent = {
    student: StudentDashboard,
    staff:   StaffDashboard,
    admin:   AdminDashboard
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
            <button className="notif-btn" title="Notifications">
              <Bell size={18} />
              <span className="notif-badge" />
            </button>
          </div>
        </div>

        {/* Render role dashboard */}
        <div key={activePage} className="animate-fade-in" style={{ height: '100%' }}>
          {DashboardComponent && (
            <DashboardComponent activePage={activePage} setActivePage={setActivePage} currentUser={currentUser} />
          )}
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
