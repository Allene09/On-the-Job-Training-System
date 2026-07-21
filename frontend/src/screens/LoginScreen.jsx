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

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const r = ROLES.find(r => r.key === role);
    setEmail(r.email);
    setPassword('pass123');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(selectedRole);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="login-screen">
      <div className="login-card" style={{ position: 'relative' }}>
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
        </form>

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
