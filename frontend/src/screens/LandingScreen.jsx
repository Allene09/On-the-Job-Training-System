import { 
  Building2, GraduationCap, Shield, TrendingUp, 
  FileCheck, Clock, ArrowRight, CheckCircle2 
} from 'lucide-react';

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

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="OJTrack" style={{ width: '40px', height: '40px' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            OJTrack
          </span>
        </div>
        <div>
          <button className="btn btn-ghost" style={{ marginRight: '16px' }} onClick={onGetStarted}>Sign In</button>
          <button className="btn btn-primary" onClick={onGetStarted}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1, maxWidth: '800px', margin: '0 auto 24px' }}>
          Streamline Your <span style={{ color: '#38bdf8' }}>On-the-Job Training</span> Workflows
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          OJTrack digitizes the entire internship process — from requirement submissions and company applications to daily time records and final evaluations.
        </p>
        <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '30px' }} onClick={onGetStarted}>
          Access System
        </button>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 40px', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px', fontWeight: 700 }}>Our Services & Features</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {services.map((s, i) => (
              <div key={i} className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: 'var(--color-bg-deep)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px' }}>Why Choose OJTrack?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Managing student internships manually leads to lost paperwork, inaccurate DTRs, and delayed approvals. We provide a single source of truth for students, coordinators, and administrators.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={20} color="#10b981" /> {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', maxWidth: '400px', height: '300px', borderRadius: '24px', 
            background: 'var(--gradient-card-glow)', border: '1px solid var(--color-border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-lg), 0 0 40px rgba(6,182,212,0.1)'
          }}>
            <TrendingUp size={80} color="#38bdf8" style={{ opacity: 0.8 }} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '30px', textAlign: 'center', borderTop: '1px solid var(--color-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} OJTrack System. Designed for efficient On-the-Job Training Monitoring.
      </footer>
    </div>
  );
}
