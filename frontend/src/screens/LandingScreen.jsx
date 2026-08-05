import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { 
  Building2, GraduationCap, Shield, TrendingUp, 
  FileCheck, Clock, ArrowRight, CheckCircle2,
  Search, MapPin, Briefcase, Users, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingScreen({ onGetStarted }) {
  const services = [
    {
      icon: <GraduationCap size={32} color="#38bdf8" />,
      title: "Student Portal",
      desc: "Log daily attendance, track required OJT hours in real-time, submit weekly narrative reports, and apply to partner companies easily."
    },
    {
      icon: <Shield size={32} color="#a78bfa" />,
      title: "Coordinator Dashboard",
      desc: "Review and approve student requirement submissions, monitor DTRs remotely, and conduct performance evaluations efficiently."
    },
    {
      icon: <Building2 size={32} color="#34d399" />,
      title: "Partner Company Directory",
      desc: "A centralized hub to discover active Host Training Establishments (HTEs), view available slots, and manage company placements."
    },
    {
      icon: <FileCheck size={32} color="#fbbf24" />,
      title: "Requirement Tracking",
      desc: "Digitized checklists for MOAs, medical certificates, parent consents, and endorsement letters. Never lose a document again."
    }
  ];

  const features = [
    "Real-time Hours Computation",
    "Role-based Access Control",
    "Digital Document Approvals",
    "Automated Performance Scoring",
    "System-wide Analytics"
  ];

  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [appliedIds, setAppliedIds] = useState([]); // track which company IDs the visitor applied to

  const [showRegModal, setShowRegModal] = useState(false);
  const [applyingCompanyId, setApplyingCompanyId] = useState(null);
  const [regForm, setRegForm] = useState({
    first_name: '', middle_name: '', last_name: '', course: '', year_section: '', gender: '', email: '', student_number: ''
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    if (showRegModal && !regForm.student_number) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      setRegForm(prev => ({ ...prev, student_number: `2026-${randomId}` }));
    }
  }, [showRegModal]);

  useEffect(() => {
    if (regForm.first_name || regForm.last_name) {
      const fn = regForm.first_name.toLowerCase().trim().replace(/\s+/g, '');
      const ln = regForm.last_name.toLowerCase().trim().replace(/\s+/g, '');
      if (fn || ln) {
        setRegForm(prev => ({ ...prev, email: `${fn}.${ln}@student.edu.ph`.replace(/^\./, '') }));
      }
    }
  }, [regForm.first_name, regForm.last_name]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/companies`)
      .then(res => res.json())
      .then(data => {
        if (data?.data) setCompanies(data.data);
      })
      .catch(() => {
        setCompanies([]);
      });
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.company_name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.industry.toLowerCase().includes(companySearch.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleApply = (company_id) => {
    if (appliedIds.includes(company_id)) return;
    setApplyingCompanyId(company_id);
    setShowRegModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: regForm.student_number,
          first_name: regForm.first_name,
          middle_name: regForm.middle_name,
          last_name: regForm.last_name,
          email: regForm.email,
          password: 'PENDING_APPROVAL',
          gender: regForm.gender,
          course: regForm.course,
          year_section: regForm.year_section,
          year_level: regForm.year_section,
          company_id: applyingCompanyId
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedIds(prev => [...prev, applyingCompanyId]);
        setShowRegModal(false);
        setRegForm({ first_name: '', middle_name: '', last_name: '', course: '', year_section: '', gender: '', email: '', student_number: '' });
      } else {
        setRegError(data.message || 'Registration failed');
      }
    } catch (err) {
      setRegError('Server error while registering');
    }
    setRegLoading(false);
  };

  const industryColor = (industry = '') => {
    if (industry.toLowerCase().includes('software') || industry.toLowerCase().includes('tech'))
      return { bg: 'rgba(56,189,248,0.12)', color: '#38bdf8' };
    if (industry.toLowerCase().includes('cyber') || industry.toLowerCase().includes('security'))
      return { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' };
    if (industry.toLowerCase().includes('data') || industry.toLowerCase().includes('cloud'))
      return { bg: 'rgba(52,211,153,0.12)', color: '#34d399' };
    return { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' };
  };
  // ---- End Partner Companies State ----

  return (
    <div className="landing-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.95)), url(/bg-impact.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* 21st Century Floating Background Orbs */}
      <div className="floating-orb orb-primary" style={{ width: '400px', height: '400px', top: '10%', left: '5%' }}></div>
      <div className="floating-orb orb-secondary" style={{ width: '500px', height: '500px', bottom: '20%', right: '5%', animationDelay: '2s' }}></div>

      {showRegModal && (
        <div className="modal-overlay" onClick={() => setShowRegModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', background: 'var(--color-bg-glass)', backdropFilter: 'blur(20px)' }}>
            <div className="modal-header">
              <h2 className="modal-title">Student Registration</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRegModal(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Create an account to submit your application.
            </p>

            {regError && (
              <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem', background: 'rgba(244,63,94,0.1)', color: 'var(--status-rejected)' }}>
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input type="text" className="form-input" readOnly value={regForm.student_number} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" required value={regForm.first_name} onChange={e => setRegForm({ ...regForm, first_name: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Middle Name</label>
                  <input type="text" className="form-input" value={regForm.middle_name} onChange={e => setRegForm({ ...regForm, middle_name: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" required value={regForm.last_name} onChange={e => setRegForm({ ...regForm, last_name: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course</label>
                <input type="text" className="form-input" required value={regForm.course} onChange={e => setRegForm({ ...regForm, course: e.target.value })} placeholder="e.g. BS Computer Science" />
              </div>

              <div className="form-group">
                <label className="form-label">Year and Section</label>
                <input type="text" className="form-input" required value={regForm.year_section} onChange={e => setRegForm({ ...regForm, year_section: e.target.value })} placeholder="e.g. 4th Year - Section A" />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" required value={regForm.gender} onChange={e => setRegForm({ ...regForm, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="divider" style={{ margin: '24px 0', borderColor: 'var(--color-border)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Account Information</h3>

              <div className="form-group">
                <label className="form-label">Email Address (Auto-generated)</label>
                <input type="email" className="form-input" required readOnly value={regForm.email} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary w-full" disabled={regLoading} style={{ justifyContent: 'center' }}>
                  {regLoading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="OJTrack" style={{ width: '40px', height: '40px' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            OJTrack
          </span>
        </div>
        <div>
          <button className="btn btn-primary" style={{ marginRight: '16px' }} onClick={() => setShowRegModal(true)}>
            Student Registration
          </button>
          <button className="btn btn-ghost" onClick={onGetStarted}>
            Sign In <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="kinetic-type" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1, margin: '0 auto 24px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          Streamline Your <span style={{ color: '#38bdf8' }}>OJTrack Monitoring System</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          OJTrack digitizes the entire internship process — from requirement submissions and company applications to daily time records and final evaluations.
        </motion.p>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 40px', background: 'rgba(30, 41, 59, 0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px', fontWeight: 700 }}>Our Services &amp; Features</motion.h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {services.map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                key={i} className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: 'var(--color-bg-deep)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Partner Companies Section ===== */}
      <section style={{ padding: '70px 40px', background: 'var(--color-bg-base)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '999px', padding: '6px 16px', marginBottom: '16px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <Building2 size={14} /> School Partner Companies
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
              Discover Our Partner <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Companies</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
              Browse accredited Host Training Establishments (HTEs) partnered with the school. Apply directly to secure your OJT placement.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ position: 'relative', maxWidth: '480px', margin: '0 auto 36px' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by company name, industry, or location..."
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            {companySearch && (
              <button
                onClick={() => setCompanySearch('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1 }}
              >✕</button>
            )}
          </motion.div>

          {/* Results count */}
          {companySearch && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
              {filteredCompanies.length} result{filteredCompanies.length !== 1 ? 's' : ''} for "{companySearch}"
            </p>
          )}

          {/* Company Cards Grid */}
          {filteredCompanies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem' }}>No companies found matching your search.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredCompanies.map((c, i) => {
                const isFull = c.slots_available === 0;
                const isApplied = appliedIds.includes(c.company_id);
                const { bg: indBg, color: indColor } = industryColor(c.industry);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * (i % 3) }}
                    key={c.company_id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      backdropFilter: 'blur(12px)',
                      border: isFull
                        ? '1px solid rgba(100,116,139,0.3)'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: isFull ? 0.7 : 1,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => { if (!isFull) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Company Photo */}
                    <div style={{ height: '140px', width: '100%', background: `url(${c.photo_url ? API_BASE_URL.replace('/api', '') + c.photo_url : ''}) center/cover no-repeat`, backgroundColor: '#1e293b' }} />
                    
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    {/* Full banner */}
                    {isFull && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', borderRadius: '8px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Full
                      </div>
                    )}

                    {/* Company Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: `linear-gradient(135deg, ${indColor}33, ${indColor}11)`,
                        border: `1px solid ${indColor}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', fontWeight: 800, color: indColor, flexShrink: 0
                      }}>
                        {c.company_name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.company_name}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: indBg, color: indColor, borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600, marginTop: '4px' }}>
                          <Briefcase size={11} /> {c.industry}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} style={{ flexShrink: 0 }} /> {c.address}
                      </div>
                      {c.requirements && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Requirements:</span> {c.requirements}
                        </div>
                      )}
                    </div>

                    {/* Slots */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: isFull ? 'rgba(244,63,94,0.07)' : 'rgba(56,189,248,0.07)',
                      border: `1px solid ${isFull ? 'rgba(244,63,94,0.2)' : 'rgba(56,189,248,0.15)'}`,
                      borderRadius: '10px', padding: '8px 12px'
                    }}>
                      <Users size={15} color={isFull ? '#f43f5e' : '#38bdf8'} />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isFull ? '#f43f5e' : '#38bdf8' }}>
                          {c.slots_available}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          {isFull ? '— No slots available' : `slot${c.slots_available !== 1 ? 's' : ''} available`}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                      {isFull ? (
                        <button
                          disabled
                          style={{
                            width: '100%', padding: '10px', borderRadius: '10px',
                            background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
                            color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <AlertCircle size={14} /> Not Available
                        </button>
                      ) : isApplied ? (
                        <button
                          disabled
                          style={{
                            width: '100%', padding: '10px', borderRadius: '10px',
                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                            color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Clock size={14} /> Application Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(c.company_id)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '10px',
                            background: 'var(--gradient-primary)', border: 'none',
                            color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          Apply Now <ArrowRight size={14} />
                        </button>
                      )}
                    </div>

                    {/* Login prompt after applying */}
                    {isApplied && (
                      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
                        <button onClick={onGetStarted} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>Sign in</button> to complete and track your application.
                      </p>
                    )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>
      {/* ===== End Partner Companies Section ===== */}

      {/* Highlights */}
      <section style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px' }}>Why Choose OJTrack?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Managing student internships manually leads to lost paperwork, inaccurate DTRs, and delayed approvals. We provide a single source of truth for students, coordinators, and administrators.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((f, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={20} color="#10b981" /> {f}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', maxWidth: '400px', height: '300px', borderRadius: '24px', 
            background: 'var(--gradient-card-glow)', border: '1px solid var(--color-border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-lg), 0 0 40px rgba(6,182,212,0.1)'
          }}>
            <TrendingUp size={80} color="#38bdf8" style={{ opacity: 0.8 }} />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '30px', textAlign: 'center', borderTop: '1px solid var(--color-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} OJTrack System. Designed for efficient On-the-Job Training Monitoring.
      </footer>
    </div>
  );
}
