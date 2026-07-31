import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Shield, UserCog, Eye, EyeOff, BookOpen, ArrowLeft
} from 'lucide-react';

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap, email: 'student@school.edu.ph',     color: 'cyan'   },
  { key: 'staff',   label: 'Coordinator', icon: Shield,    email: 'coordinator@school.edu.ph', color: 'purple' },
  { key: 'admin',   label: 'Admin',    icon: UserCog,      email: 'admin@school.edu.ph',        color: 'green'  }
];

export default function LoginScreen({ onBack }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('student@school.edu.ph');
  const [password, setPassword] = useState('pass123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Password change state
  const [needsPassChange, setNeedsPassChange] = useState(false);
  const [changeUserId, setChangeUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const r = ROLES.find(r => r.key === role);
    setEmail(r.email);
    setPassword('pass123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const res = await login(selectedRole, email, password);
    setLoading(false);
    if (res.success) {
      if (res.requires_password_change) {
        setChangeUserId(res.user_id);
        setNeedsPassChange(true);
      }
    } else {
      setErrorMsg(res.message || 'Login failed');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: changeUserId, new_password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        // Automatically login after change
        await login(selectedRole, email, newPassword);
      } else {
        setErrorMsg(data.message || 'Failed to change password');
      }
    } catch (err) {
      setErrorMsg('Server error while changing password');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen" style={{
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.6)), url(/bg-impact.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backdropFilter: 'blur(10px)',
      minHeight: '100vh'
    }}>
      <div className="login-card" style={{ position: 'relative', background: 'var(--color-bg-glass)', backdropFilter: 'blur(20px)' }}>
        {onBack && (
          <button 
            className="btn btn-ghost" 
            style={{ position: 'absolute', top: '16px', left: '16px', padding: '8px', zIndex: 10 }} 
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.png" alt="OJTrack Logo" />
          <h1>OJTrack</h1>
          <p>On-the-Job Training Monitoring System<br/>Sign in to access your dashboard</p>
        </div>

        {/* Role selector */}
        <div className="login-tabs">
          {ROLES.map(r => (
            <button
              key={r.key}
              type="button"
              className={`login-tab ${selectedRole === r.key ? 'active' : ''}`}
              onClick={() => handleRoleChange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        {!needsPassChange ? (
          <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '8px', height: '44px', fontSize: '0.95rem' }}
          >
            {loading ? 'Signing in…' : `Sign in as ${ROLES.find(r => r.key === selectedRole)?.label}`}
          </button>
          {errorMsg && (
            <div style={{ color: '#f43f5e', fontSize: '0.85rem', marginTop: '12px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}
        </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'center' }}>
              For your security, please set a new password before continuing.
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ justifyContent: 'center', marginTop: '8px', height: '44px', fontSize: '0.95rem' }}
            >
              {loading ? 'Updating…' : 'Update Password & Login'}
            </button>
            {errorMsg && (
              <div style={{ color: '#f43f5e', fontSize: '0.85rem', marginTop: '12px', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
          </form>
        )}

        {/* Demo hint */}
        <div style={{
          marginTop: '20px', padding: '12px', background: 'rgba(56,189,248,0.06)',
          border: '1px solid rgba(56,189,248,0.15)', borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <BookOpen size={14} color="var(--text-accent)" />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Demo Credentials</span>
          </div>
          {ROLES.map(r => (
            <div key={r.key} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{r.label}:</span> {r.email} / pass123
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
