import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ColorfulDotCanvas } from './ColorfulDotCanvas';

export const HeroSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#050c18',
      }}
    >
      {/* Fullscreen Crisp Marine Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.95,
          zIndex: 0,
        }}
      >
        <source src="/videos/marine-hero.mp4" type="video/mp4" />
        <source src="/videos/marine-life.mp4" type="video/mp4" />
        <source src="https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>

      {/* Subtle Ocean Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0, 10, 25, 0.25) 0%, rgba(0, 5, 15, 0.1) 50%, rgba(0, 10, 30, 0.5) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Interactive Rainbow Honeycomb Dot Canvas (Hover Trail Particle Effect) */}
      <ColorfulDotCanvas />

      {/* Floating White Card for Light Mode (Desktop: exact bottom: 48px, right: 5%, padding: 52px 44px, borderRadius: 4px) */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? '24px' : '48px',
          left: isMobile ? '50%' : 'auto',
          right: isMobile ? 'auto' : '5%',
          transform: isMobile ? 'translateX(-50%)' : 'none',
          width: '90%',
          maxWidth: '640px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: isMobile ? '32px 24px' : '52px 44px',
          borderRadius: isMobile ? '12px' : '4px',
          zIndex: 10,
          boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxSizing: 'border-box',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.1rem, 3.6vw, 3.1rem)',
            fontWeight: 500,
            lineHeight: 1.12,
            color: '#000000',
            marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}
        >
          First believers in protecting marine life through the AI Frontier®
        </motion.h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.975rem',
            lineHeight: 1.6,
            color: 'rgba(0, 0, 0, 0.78)',
            marginBottom: '32px',
            maxWidth: '540px',
          }}
        >
          We are creating the intelligence layer between marine data and action — uniting offline-first field capture, pseudonymous source protection, and explainable AI response workflows.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/about" className="btn-frontier" style={{ borderRadius: '2px', padding: '14px 32px' }}>
            Read our manifesto
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
