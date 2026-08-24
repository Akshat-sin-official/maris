import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Cpu, RefreshCw, Eye, CheckCircle2, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    interest: 'Web Intelligence Demo',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const demos = [
    { title: 'Web Intelligence Demo', desc: 'Conversational marine intelligence interface for spatial-temporal querying.', icon: Radio },
    { title: 'Field Demo', desc: 'Offline observation capture, SQLite storage, & automatic cloud synchronization.', icon: RefreshCw },
    { title: 'Agentic Demo', desc: 'Multi-agent collaboration between Planner, Weather, Ocean, GIS & PFZ agents.', icon: Cpu },
    { title: 'Intelligence Demo', desc: 'Evidence combined into an explainable recommendation with provenance metadata.', icon: Eye },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              DEMO REQUEST & CONTACT
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.12, marginBottom: '24px', maxWidth: '900px' }}>
            See MARIS in action.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'rgba(0, 0, 0, 0.75)', maxWidth: '780px', lineHeight: 1.6 }}>
            Explore how MARIS connects marine data, collaborative agents and field intelligence into explainable decision support.
          </p>
        </motion.div>
      </section>

      {/* Four Demo Options Grid */}
      <section style={{ padding: '0 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {demos.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                onClick={() => setFormData({ ...formData, interest: d.title })}
                style={{
                  padding: '24px',
                  backgroundColor: formData.interest === d.title ? '#000000' : '#ffffff',
                  color: formData.interest === d.title ? '#ffffff' : '#000000',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ marginBottom: '14px' }}>
                  <Icon size={24} color={formData.interest === d.title ? '#fa2edf' : '#000000'} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
                  {d.title}
                </h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.4, margin: 0 }}>
                  {d.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact & Demo Form */}
      <section style={{ padding: '0 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(250,46,223,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 color="#fa2edf" size={36} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#000000', marginBottom: '12px' }}>
                Demo Request Received
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'rgba(0,0,0,0.72)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Thank you, <strong style={{ color: '#000' }}>{formData.name}</strong>. Our engineering team will reach out to schedule your interactive <span style={{ color: '#fa2edf', fontWeight: 600 }}>{formData.interest}</span> session.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Aris Thorne"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Organization / Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. National Marine Fisheries Authority"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Official Email</label>
                  <input
                    type="email"
                    placeholder="official@agency.gov"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Primary Interest Area</label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option>Web Intelligence Demo</option>
                    <option>Field Demo</option>
                    <option>Agentic Demo</option>
                    <option>Intelligence Demo</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Message / Operational Scope</label>
                <textarea
                  rows={4}
                  placeholder="Describe your operational areas, specific data integration needs, or field team size..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                className="btn-frontier"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <Send size={18} />
                <span>Request a MARIS Demo</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
