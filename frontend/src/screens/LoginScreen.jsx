import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import {
  GraduationCap, Shield, UserCog, Eye, EyeOff, BookOpen, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap, color: 'cyan' },
  { key: 'staff', label: 'Coordinator', icon: Shield, color: 'purple' },
  { key: 'admin', label: 'Admin', icon: UserCog, color: 'green' }
];

export default function LoginScreen({ onBack }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Password change state
  const [needsPassChange, setNeedsPassChange] = useState(false);
  const [changeUserId, setChangeUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
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
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
        className="login-card" style={{ position: 'relative', background: 'var(--color-bg-glass)', backdropFilter: 'blur(20px)' }}>
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
        <AnimatePresence mode="wait">
        {!needsPassChange ? (
          <motion.form 
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleLogin}>
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
          </motion.form>
        ) : (
          <motion.form 
            key="change-password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleChangePassword}>
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
          </motion.form>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
