import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Eye, RefreshCw } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const ApproachPage: React.FC = () => {
  const pipelineSteps = [
    { num: '01', title: 'REPORT', desc: 'Structured evidence capture (Photo, Video, GPS, Timestamp, Notes) via React Native mobile client.' },
    { num: '02', title: 'PROTECT', desc: '10-digit pseudonymous tipster ID & cryptographic encryption shielding source identity.' },
    { num: '03', title: 'TRANSMIT', desc: 'Offline-first queue saved to local SQLite, auto-syncing seamlessly when connectivity returns.' },
    { num: '04', title: 'INTELLIGENCE', desc: 'Central Control Room ingestion &PostgreSQL/MongoDB GIS spatial relationship matching.' },
    { num: '05', title: 'PRIORITIZE', desc: 'Explainable AI priority scoring (+22 species match, +19 location overlap, +16 commodity record).' },
    { num: '06', title: 'VERIFY', desc: 'Human-in-the-loop verification workflow preserving confidence levels (High / Medium / Low / Unknown).' },
    { num: '07', title: 'COORDINATE', desc: 'Authorized officer dispatch routing and multi-incident active case management.' },
    { num: '08', title: 'RESPOND', desc: 'Real-time field response updates (Accepted → Travelling → On Site → Evidence Collected).' },
    { num: '09', title: 'RECORD', desc: 'Immutable digital case timeline documenting evidence provenance and audit history.' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Header Banner */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.6)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              TECHNICAL APPROACH & SOLUTION ARCHITECTURE
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
              fontWeight: 500,
              color: '#000000',
              lineHeight: 1.1,
              marginBottom: '24px',
              maxWidth: '900px',
            }}
          >
            We are not adding another reporting form. We are creating the intelligence layer between information and action.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'rgba(0, 0, 0, 0.75)',
              maxWidth: '740px',
              marginBottom: '40px',
            }}
          >
            MARIS turns fragmented field evidence and confidential tips into structured, traceable, explainable intelligence. Built from the ground up for zero-cellular marine environments.
          </p>
        </motion.div>
      </section>

      {/* 10-Step Canonical Pipeline Grid */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              CANONICAL WORKFLOW
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#000000', marginTop: '8px' }}>
              The 9-Stage MARIS Intelligence Loop
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {pipelineSteps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '32px 28px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600, color: '#fa2edf' }}>
                      {step.num}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.6)' }}>
                      STAGE {idx + 1}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#000000', marginBottom: '12px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.925rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Differentiators & Principles */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ENGINEERING PRINCIPLES
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#000000', marginTop: '8px' }}>
            Responsible AI & Operational Integrity
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {/* Card 1: Offline First */}
          <div style={{ padding: '36px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#ffffff', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(250,46,223,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <RefreshCw color="#fa2edf" size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#000000', marginBottom: '14px' }}>
              Offline-First Preservation
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.6 }}>
              In 73% of offshore marine operations, cellular connectivity fails. MARIS stores evidence locally in encrypted SQLite storage (`Saved securely on device — waiting for connection`), auto-syncing seamlessly without duplicate creation when back in range.
            </p>
          </div>

          {/* Card 2: Confidence Aware AI */}
          <div style={{ padding: '36px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#ffffff', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(0,242,254,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Cpu color="#00a8b5" size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#000000', marginBottom: '14px' }}>
              Confidence-Aware AI Policy
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.6 }}>
              MARIS explicitly prohibits 100% certainty claims. Outputs use <strong style={{ color: '#000' }}>"Possible Identification"</strong> with clear confidence states (High / Medium / Low / Unknown). Low-confidence items trigger <em style={{ color: '#fa2edf' }}>"Identification uncertain — human verification recommended"</em>.
            </p>
          </div>

          {/* Card 3: Explainable Why Flagged */}
          <div style={{ padding: '36px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#ffffff', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(107,17,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Eye color="#6b11ff" size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#000000', marginBottom: '14px' }}>
              Explainable "Why Flagged?"
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.6 }}>
              No black boxes. Every prioritized case exposes contributing evidence breakdown:
              <br />
              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#333', display: 'block', marginTop: '8px', backgroundColor: '#f5f5f7', padding: '10px', borderRadius: '6px' }}>
                +22 Same species as previous incidents<br />
                +19 Location overlaps historical activity<br />
                +16 Commodity matches historical records
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Specs Banner */}
      <section style={{ backgroundColor: '#050c18', color: '#ffffff', padding: '90px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              SYSTEM ARCHITECTURE
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#ffffff', marginTop: '8px' }}>
              Production Tech Stack & Data Layer
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: '#fa2edf', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Mobile App</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>React Native • TypeScript • SQLite Local Store • GPS Camera Capture</p>
            </div>
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: '#00f2fe', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Central Web Application</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>React.js • TypeScript • GIS Spatial Dashboard • Control Room Queue</p>
            </div>
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: '#4facfe', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Backend & API</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Node.js • NestJS / Express REST APIs • WebSockets Realtime Sync</p>
            </div>
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: '#6b11ff', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Database & Security</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>MongoDB Geospatial • JWT Auth • Role-Based Access Control • Pseudonymous Tipster ID</p>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
