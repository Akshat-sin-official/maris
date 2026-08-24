import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HoneycombCanvas } from './HoneycombCanvas';

export const ManifestoSection: React.FC = () => {
  const principles = [
    {
      title: 'Principles over playbooks',
      description:
        'We build for offline sea reality, not ideal network conditions. We support field officers where connectivity fails',
    },
    {
      title: 'Depth before hype',
      description:
        'We look beyond black-box claims. Technical explainability and confidence signals matter more than unverified AI guesses',
    },
    {
      title: 'Founder as compass',
      description:
        'The strongest intelligence begins with frontline tipsters who see clearly. We protect their pseudonymous identity',
    },
    {
      title: 'Evolution, not prediction',
      description:
        'We don’t pretend to forecast crime. We support historical corridor matching, fast incident sync, and human verification',
    },
  ];

  return (
    <section
      id="manifesto"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '120px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Background Honeycomb Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <HoneycombCanvas splitOnScroll={true} interactive={true} gridSpacing={16} dotSize={1.8} />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '64px',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              color: '#000000',
              fontWeight: 500,
            }}
          >
            Our compass for defining marine intelligence
          </h2>
        </div>

        {/* 4 Principles Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            width: '100%',
          }}
        >
          {principles.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '4px',
                padding: '32px 24px',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: '#fa2edf', fontWeight: 600 }}>0{idx + 1}</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#000000', margin: 0 }}>
                  {p.title}
                </h3>
                <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                  {p.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div>
          <Link
            aria-label="See our approach"
            className="btn-frontier"
            to="/about"
          >
            See our approach
          </Link>
        </div>
      </div>
    </section>
  );
};
