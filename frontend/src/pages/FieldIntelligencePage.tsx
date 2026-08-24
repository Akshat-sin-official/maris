import React from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Clock, FileText, WifiOff, RefreshCw, CheckCircle2, MessageSquare } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const FieldIntelligencePage: React.FC = () => {
  const syncStates = [
    { state: 'PENDING', desc: 'Saved securely to local SQLite device database. Waiting for network signal.', color: '#fa2edf' },
    { state: 'SYNCING', desc: 'Connection established. Uploading encrypted evidence packages to MARIS API.', color: '#000000' },
    { state: 'SYNCED', desc: 'Server acknowledgment received. Intelligence integrated into Control Room queue.', color: '#000000' },
    { state: 'FAILED', desc: 'Network dropped during transit. Auto-retry scheduled on next signal connection.', color: '#fa2edf' },
    { state: 'CONFLICT', desc: 'Duplicate report ID detected. Server merged record preserving audit provenance.', color: '#000000' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              OFFLINE-FIRST FIELD INTELLIGENCE
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.12, marginBottom: '24px', maxWidth: '900px' }}>
            Marine intelligence, even when connectivity is weak.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'rgba(0, 0, 0, 0.75)', maxWidth: '780px', lineHeight: 1.6 }}>
            In 73% of offshore marine operations, cellular networks drop. MARIS provides resilient, offline-first evidence capture that automatically syncs once connection returns.
          </p>
        </motion.div>
      </section>

      {/* Main Field Visual Sequence Mockup */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              FIELD DEVICE WORKFLOW
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#000000', marginTop: '8px' }}>
              Airplane Mode Field Observation & Auto-Sync
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            {/* Step 1: Capture */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fa2edf', marginBottom: '12px', textTransform: 'uppercase' }}>
                STAGE 1: FIELD CAPTURE
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#000', marginBottom: '20px' }}>
                Capture Observation
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'rgba(0,0,0,0.8)', marginBottom: '24px', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Camera size={16} color="#fa2edf" /><span>Photo & Video Evidence</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={16} color="#fa2edf" /><span>EXIF GPS Coordinates</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={16} color="#fa2edf" /><span>ISO UTC Timestamp</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={16} color="#fa2edf" /><span>Structured Field Notes</span></div>
              </div>

              <div style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'center', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                [ Save Observation ]
              </div>
            </div>

            {/* Step 2: No Internet */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fa2edf', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <WifiOff size={16} />
                <span>STAGE 2: NO CELLULAR SIGNAL</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#000', marginBottom: '20px' }}>
                Local SQLite Storage
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000000', fontWeight: 600, fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="#fa2edf" />
                  <span>Saved locally to device database</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(0,0,0,0.6)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  <RefreshCw size={16} />
                  <span>Waiting for connection...</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(250,46,223,0.08)', color: '#fa2edf', border: '1px solid rgba(250,46,223,0.2)', textAlign: 'center', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                Report Retained & Encrypted Offline
              </div>
            </div>

            {/* Step 3: Connection Restored */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000', marginBottom: '12px', textTransform: 'uppercase' }}>
                STAGE 3: CONNECTION RESTORED
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#000', marginBottom: '20px' }}>
                Automatic Synchronization
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fa2edf', fontWeight: 600, fontSize: '0.95rem' }}>
                  <RefreshCw size={18} />
                  <span>↑ Synchronizing with MARIS API</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000000', fontWeight: 700, fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="#fa2edf" />
                  <span>✓ Synced to Control Room</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'center', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                Integrated into Shared Intelligence Layer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sync State Specifications Table */}
      <section style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TECHNICAL STATE MACHINE
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#000000', marginTop: '8px' }}>
            Supported Offline Synchronization States
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {syncStates.map((s) => (
            <div key={s.state} style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: s.color, display: 'block', marginBottom: '8px' }}>
                {s.state}
              </span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BiChat Capability Banner */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(250,46,223,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MessageSquare color="#fa2edf" size={24} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            LOW-CONNECTIVITY MESSAGING
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', marginTop: '8px', marginBottom: '16px' }}>
            BiChat Communication Capability
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.75)', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
            MARIS provides BiChat messaging capability for controlled field communication under low-bandwidth marine conditions, directly associating messages with active incident reports.
          </p>
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
