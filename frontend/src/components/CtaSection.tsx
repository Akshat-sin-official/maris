import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface CtaSectionProps {
  subheading?: string;
  heading?: string;
  buttonText?: string;
  buttonLink?: string;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  subheading = 'For decisions that happen in the real world',
  heading = 'Deploy MARIS Intelligence',
  buttonText = 'Request a Demo',
  buttonLink = '/contact',
}) => {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            color: 'rgba(0, 0, 0, 0.6)',
            margin: 0,
          }}
        >
          {subheading}
        </p>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 500,
            color: '#000000',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {heading}
        </motion.h2>

        <div style={{ marginTop: '8px' }}>
          <Link to={buttonLink} className="btn-frontier">
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};
