import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HoneycombCanvas } from './HoneycombCanvas';

export const NetworkSection: React.FC = () => {
  return (
    <section
      id="network"
      style={{
        position: 'relative',
        padding: '120px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          padding: '100px 32px 80px',
          borderRadius: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Honeycomb Canvas Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <HoneycombCanvas splitOnScroll={true} interactive={true} gridSpacing={16} dotSize={1.8} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            PROPOSED SYSTEM ARCHITECTURE
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              color: '#000000',
              maxWidth: '850px',
              margin: 0,
            }}
          >
            The proposed marine intelligence architecture
          </motion.h2>

          <div style={{ marginTop: '8px' }}>
            <Link
              aria-label="Explore technology stack"
              className="btn-frontier"
              to="/technology"
            >
              Explore architecture
            </Link>
          </div>

          {/* System Target Specifications Grid */}
          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '32px',
              width: '100%',
              maxWidth: '960px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 500,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                06
              </h3>
              <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.875rem', marginTop: '10px', lineHeight: 1.4 }}>
                Core operational use cases specified in SIH 26176
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
                  fontWeight: 500,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                08
              </h3>
              <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.875rem', marginTop: '10px', lineHeight: 1.4 }}>
                Specialized AI domain agents in ORCA multi-agent engine
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 500,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                100%
              </h3>
              <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.875rem', marginTop: '10px', lineHeight: 1.4 }}>
                Traceable evidence provenance & source identity protection
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 500,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                0.0s
              </h3>
              <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.875rem', marginTop: '10px', lineHeight: 1.4 }}>
                Cellular network dependency for offline field evidence capture
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
