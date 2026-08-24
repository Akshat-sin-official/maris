import React from 'react';
import { motion } from 'framer-motion';
import { CtaSection } from '../components/CtaSection';

export const TechnologyPage: React.FC = () => {
  const techStack = [
    { category: 'Frontend Web', tech: 'React.js 19 + TypeScript', spec: 'Responsive GIS Dashboard, Control Room Queue, & Intelligence Explorer.' },
    { category: 'Mobile Client', tech: 'React Native + TypeScript', spec: 'Offline-first camera/GPS capture, SQLite local store, & auto-sync engine.' },
    { category: 'Backend REST API', tech: 'Node.js + Express + TypeScript', spec: 'Modular REST endpoints, request validation, & provider adapter pipeline.' },
    { category: 'Database & GIS', tech: 'MongoDB Geospatial', spec: 'GeoJSON 2D spatial indexing, multi-item evidence schema, & audit logging.' },
    { category: 'Realtime Layer', tech: 'Socket Event Bus', spec: 'Real-time incident dispatch updates, officer status sync, & alert triggers.' },
    { category: 'AI & Analytics', tech: 'Hybrid Rules + Agentic ML', spec: 'Multi-agent orchestration, confidence scoring, & explainable decision signals.' },
  ];

  const principles = [
    { label: 'Provider Abstraction', desc: 'Data sources isolated behind standardized provider adapters for clean API decoupling.' },
    { label: 'Evidence Provenance', desc: 'Complete metadata provenance chain preserved for every recommendation.' },
    { label: 'Confidence-Aware Outputs', desc: 'Explicit probability states (High / Medium / Low / Unknown) with zero fake claims.' },
    { label: 'Human-in-the-Loop', desc: 'AI supports operational decision-making, never automatic legal determinations.' },
    { label: 'Graceful Degradation', desc: 'System operates seamlessly offline when cellular signals drop offshore.' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Minimalist Hero */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SYSTEM ARCHITECTURE & INFRASTRUCTURE
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.1, marginBottom: '20px', maxWidth: '850px' }}>
            Modular marine intelligence architecture.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'rgba(0, 0, 0, 0.72)', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
            MARIS combines modern MERN stack web infrastructure, React Native mobile clients, MongoDB geospatial indexing, and collaborative agentic AI.
          </p>
        </motion.div>
      </section>

      {/* Clean Minimalist Dataflow Architecture Box */}
      <section style={{ padding: '40px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            SYSTEM DATAFLOW
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#000000', margin: 0 }}>
            High-Level Component Flow
          </h2>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '36px 28px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#000000', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>React Web Dashboard</div>
            <div style={{ padding: '10px 20px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>React Native Mobile App</div>
          </div>

          <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.3)', marginBottom: '16px' }}>↓ (HTTP REST / WebSockets)</div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ padding: '12px 28px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
              MARIS Node.js + Express API Layer
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.3)', marginBottom: '20px' }}>↓</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>MongoDB Geospatial</div>
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>Agentic AI Engine</div>
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>Realtime Bus</div>
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>SQLite Field Sync</div>
          </div>

          <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.3)', marginBottom: '16px' }}>↓</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.08)', display: 'inline-block', color: 'rgba(0,0,0,0.8)' }}>
              External Data Providers (IMD, INCOIS, Copernicus Marine, OSM)
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Technical Specifications List */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            PRODUCTION STACK
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', margin: 0 }}>
            Technology Specifications
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {techStack.map((item, idx) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              style={{
                padding: '28px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                alignItems: 'baseline',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  {item.category}
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#000000', margin: 0 }}>
                  {item.tech}
                </h3>
              </div>

              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>
                {item.spec}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Minimalist Responsible Principles */}
      <section style={{ padding: '80px 24px 100px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            SYSTEM RELIABILITY
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', margin: 0 }}>
            Responsible Architecture Principles
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {principles.map((p, idx) => (
            <div key={idx} style={{ padding: '28px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#000000', margin: '0 0 10px 0' }}>
                {p.label}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
