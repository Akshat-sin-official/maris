import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const AboutPage: React.FC = () => {
  const philosophy = [
    { num: '01', title: 'Connect', desc: 'Bring fragmented satellite, weather, oceanographic and ranger observation feeds into one unified spatial-temporal intelligence graph.' },
    { num: '02', title: 'Reason', desc: 'Correlate spatial boundaries, ocean currents, thermal fronts, wave periods, and multi-year historical poaching corridors.' },
    { num: '03', title: 'Explain', desc: 'Expose explicit evidence provenance logs showing why specific risk scores and safety recommendations were generated.' },
    { num: '04', title: 'Act', desc: 'Empower frontline officers, fishermen, and control room operators with actionable, human-in-the-loop decision support.' },
  ];

  const systemGuarantees = [
    { label: 'Human-in-the-Loop', desc: 'MARIS provides explainable decision support; it never makes automated legal or enforcement determinations.' },
    { label: 'Evidence Provenance', desc: 'Every recommendation links back to verifiable data source timestamps, spatial bounds, and adapter records.' },
    { label: 'Offline-First Sea Reality', desc: 'Core field capture functions run locally on device SQLite storage without cellular network dependency.' },
    { label: 'Source Identity Protection', desc: 'Confidential tipsters receive 10-digit pseudonymous Tipster IDs ensuring zero identity exposure.' },
  ];

  const nonGoals = [
    'Not an automated legal determination system',
    'Not a black-box predictive crime magic wand',
    'Not built on ideal-network internet assumptions',
    'Not a replacement for authorized human verification',
  ];

  const sihHighlights = [
    'Natural-language interaction & multi-turn marine query understanding',
    'Collaborative agentic planning & domain-agent task decomposition',
    'Multi-source Earth Observation & meteorological data integration',
    'Spatial-temporal reasoning across dynamic ocean conditions',
    'Explainable, evidence-backed decision support & hazard awareness',
    'Potential Fishing Zone (PFZ) intelligence & harvesting suitability',
    'Geofencing marine protected areas (MPAs) & sanctuary boundaries',
    'Offline-first field intelligence capture & automatic synchronization',
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Minimalist Hero */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              VISION & PHILOSOPHY
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.1, marginBottom: '20px', maxWidth: '850px' }}>
            Why MARIS exists
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'rgba(0, 0, 0, 0.72)', maxWidth: '750px', lineHeight: 1.6, margin: 0 }}>
            MARIS was designed around the gap between the growing volume of marine information and the practical need to turn that information into contextual, explainable decisions.
          </p>
        </motion.div>
      </section>

      {/* Four Core Pillars Grid */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {philosophy.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              style={{
                padding: '32px 24px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', display: 'block', marginBottom: '12px' }}>
                {p.num}
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#000000', marginBottom: '8px' }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Guarantees vs Non-Goals Section */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              RESPONSIBLE AI GOVERNANCE
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', marginTop: '8px' }}>
              System Principles & Boundaries
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {/* Principles Column */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '36px', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#000" />
                <span>WHAT MARIS IS (CORE GUARANTEES)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {systemGuarantees.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 size={18} color="#000000" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#000', fontSize: '0.95rem' }}>{item.label}:</strong>
                      <span style={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Goals Column */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '36px', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="rgba(0,0,0,0.5)" />
                <span>WHAT MARIS IS NOT (EXPLICIT NON-GOALS)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {nonGoals.map((ng, i) => (
                  <div key={i} style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', fontSize: '0.9rem', color: 'rgba(0,0,0,0.8)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'rgba(0,0,0,0.4)', fontWeight: 700 }}>✕</span>
                    <span>{ng}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Decision Support Chain */}
      <section style={{ padding: '90px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            DECISION-SUPPORT CHAIN
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', margin: 0 }}>
            From Raw Data to Authorized Action
          </h2>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '40px 24px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#000000', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>1. DATA</div>
            <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>2. EVIDENCE</div>
            <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>3. REASONING</div>
            <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>4. CONFIDENCE</div>
            <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>5. RECOMMENDATION</div>
            <div style={{ padding: '14px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '8px', fontWeight: 700 }}>6. HUMAN DECISION</div>
          </div>
        </div>
      </section>

      {/* SIH Alignment Section */}
      <section style={{ padding: '80px 24px 100px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', padding: '6px 14px', borderRadius: '9999px', marginBottom: '16px' }}>
            <Award size={16} color="#000000" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000000', letterSpacing: '0.05em' }}>
              PROBLEM STATEMENT 26176 // ORCA
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#000000', margin: 0 }}>
            Smart India Hackathon 2026 Compliance
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(0,0,0,0.72)', marginTop: '8px', lineHeight: 1.6, maxWidth: '800px' }}>
            ORCA (Marine EcOsystem Reasoning with Collaborative Agents) — Engineered to fulfill SIH 26176 requirements for AI-driven marine wildlife intelligence and decision support.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {sihHighlights.map((item, idx) => (
            <div key={idx} style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={18} color="#000000" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.8)', fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
