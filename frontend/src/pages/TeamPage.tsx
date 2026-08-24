import React from 'react';
import { motion } from 'framer-motion';
import { CtaSection } from '../components/CtaSection';

export const TeamPage: React.FC = () => {
  const roles = [
    {
      num: '01',
      title: 'Citizen Observer',
      tagline: 'Public Incident Reporting',
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      can: ['Create simple reports', 'Upload evidence (photo/video)', 'View own submission status', 'Confidential submission pathway'],
      cannot: ['View internal intelligence', 'View other citizen reports', 'View sensitive officer locations', 'Modify case decisions'],
    },
    {
      num: '02',
      title: 'Confidential Tipster',
      tagline: 'Pseudonymous Identity Protection',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      can: ['10-digit pseudonymous tipster ID', 'Minimal identity exposure', 'Encrypted evidence submission', 'Confidential status tracking'],
      cannot: ['View internal investigation notes', 'Access officer dispatch logs', 'Expose personal identity to control room'],
    },
    {
      num: '03',
      title: 'Field Officer',
      tagline: 'Rapid Offline Evidence Capture',
      img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
      can: ['Offline incident creation (SQLite)', 'GPS, camera, & timestamp capture', 'Multi-item evidence logging', 'View assigned cases & AI signals'],
      cannot: ['Manage organization-wide users', 'Override global security policies'],
    },
    {
      num: '04',
      title: 'Control Room Operator',
      tagline: 'Central Incident Prioritization',
      img: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80',
      can: ['Priority queue management', 'Review evidence & AI signals', 'Assign cases to field officers', 'Track real-time response status'],
      cannot: ['Access unblinded tipster personal identities without explicit authorization'],
    },
    {
      num: '05',
      title: 'Supervisor',
      tagline: 'Operational Oversight & Audit',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      can: ['Oversee all active cases', 'Review officer assignments', 'Approve/escalate case verifications', 'Inspect immutable case timelines'],
      cannot: ['Bypass security audit logging'],
    },
    {
      num: '06',
      title: 'Organization Administrator',
      tagline: 'Security & Access Control',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      can: ['Manage organization users & roles', 'Set operational area boundaries', 'Configure RBAC permissions', 'Inspect system audit logs'],
      cannot: ['Fabricate historical evidence records'],
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Header */}
      <section style={{ padding: '80px 24px 50px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              02 // SYSTEM USERS & ROLE-BASED ACCESS CONTROL (RBAC)
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontWeight: 500, color: '#000000', marginBottom: '20px' }}>
            Multi-Tier User Roles & Security Matrix
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'rgba(0,0,0,0.72)', maxWidth: '720px', lineHeight: 1.6 }}>
            MARIS enforces strict role-based authorization to protect sensitive intelligence, safeguard confidential tipster identities, and streamline field-to-control-room coordination.
          </p>
        </motion.div>
      </section>

      {/* Role Cards Grid */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {roles.map((role, idx) => (
            <motion.div
              key={role.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image Banner */}
              <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={role.img}
                  alt={role.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(0%)',
                    transition: 'transform 0.5s ease',
                  }}
                />
                <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.75)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' }}>
                  ROLE {role.num}
                </div>
              </div>

              {/* Role Body */}
              <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#000000', margin: '0 0 4px 0' }}>
                    {role.title}
                  </h3>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fa2edf', display: 'block', marginBottom: '20px' }}>
                    {role.tagline}
                  </span>

                  {/* Permissions Checklist */}
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                      AUTHORIZED CAPABILITIES
                    </span>
                    {role.can.map((item, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'rgba(0,0,0,0.8)', marginBottom: '6px' }}>
                        <span style={{ color: '#000000', fontWeight: 700 }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restricted Items */}
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    RESTRICTED ACCESS
                  </span>
                  {role.cannot.map((item, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.825rem', color: 'rgba(0,0,0,0.5)', marginBottom: '4px' }}>
                      <span style={{ color: '#fa2edf', fontWeight: 700 }}>✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
