import React from 'react';
import { motion } from 'framer-motion';
import { HoneycombCanvas } from '../components/HoneycombCanvas';
import { Lock, CheckCircle } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const NetworkPage: React.FC = () => {
  const stats = [
    { num: '500+', label: 'Protected coastal checkpoints & marine corridors covered' },
    { num: '99.4%', label: 'Species AI & illegal catch detection accuracy' },
    { num: '10,000+', label: 'Pseudonymous tipster reports securely protected' },
    { num: '< 2.4s', label: 'Offline-first field dispatch sync latency' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero Header with Autonomous Honeycomb Canvas */}
      <section
        style={{
          position: 'relative',
          padding: '100px 24px 80px',
          maxWidth: '1200px',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '24px',
          border: '1px solid rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
          marginBottom: '60px',
        }}
      >
        {/* Honeycomb Canvas Background with Autonomous Moving Pink Waves */}
        <HoneycombCanvas />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                GLOBAL MARINE NETWORK & INFRASTRUCTURE
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', marginBottom: '24px', lineHeight: 1.1 }}>
              Unlock the power of our marine intelligence network
            </h1>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'rgba(0,0,0,0.75)', lineHeight: 1.6, marginBottom: '40px' }}>
              MARIS links coastal enforcement agencies, marine sanctuary rangers, and confidential field tipsters into a unified, cryptographically protected intelligence grid.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Network Metrics Bar */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '80px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            {stats.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 600, color: '#fa2edf', lineHeight: 1, marginBottom: '12px' }}>
                  {item.num}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.5, margin: 0 }}>
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pseudonymous Tipster Security Spec Section */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              FR-24 — TIPSTER PROTECTION
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#000000', marginBottom: '20px' }}>
              10-Digit Pseudonymous Tipster ID Architecture
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.6, marginBottom: '24px' }}>
              A major vulnerability in conventional wildlife crime reporting is source identity exposure. MARIS assigns a cryptographically generated 10-digit pseudonymous Tipster ID for operational interaction.
            </p>
            <div style={{ backgroundColor: '#f5f5f7', padding: '20px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', fontFamily: 'monospace', fontSize: '0.9rem', color: '#333' }}>
              Pseudonymous Tipster ID (e.g. #TP-8840291402)<br />
              + Report ID (#REP-99410)<br />
              + Internal Protected Identity Record (Encrypted)
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: '40px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Lock color="#fa2edf" size={24} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, color: '#000000' }}>
                Tip ≠ Proof Policy
              </h3>
            </div>
            <p style={{ fontSize: '0.925rem', color: 'rgba(0,0,0,0.75)', lineHeight: 1.6, marginBottom: '20px' }}>
              MARIS explicitly maintains separate data fields for tips, evidence, AI outputs, and verified incidents. A submitted tip remains distinct from confirmed criminal proof until verified by authorized personnel.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: 'rgba(0,0,0,0.85)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#000000" />
                <span>Zero identity leaks to control room operators</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#000000" />
                <span>End-to-End encrypted evidence transmission</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#000000" />
                <span>Immutable audit trail logging for all actions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
