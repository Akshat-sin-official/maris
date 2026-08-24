import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribedEmail(email);
      setShowToast(true);
      setEmail('');

      // Auto dismiss after 3.5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3500);
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: isMobile ? '60px 20px 32px' : '80px 48px 40px 48px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '80px 180px 220px 1fr',
          gap: isMobile ? '36px' : '32px',
          alignItems: 'start',
          maxWidth: '1400px',
          margin: isMobile ? '0 auto 60px' : '0 auto 120px 0',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Top Left 2-Dot Logo Icon (:) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
          <div style={{ width: '6px', height: '6px', backgroundColor: '#000000', borderRadius: '50%' }} />
          <div style={{ width: '6px', height: '6px', backgroundColor: '#000000', borderRadius: '50%' }} />
        </div>

        {/* 2. Primary Navigation Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/problem" style={linkStyle}>Problem</Link>
          <Link to="/intelligence" style={linkStyle}>Intelligence</Link>
          <Link to="/agents" style={linkStyle}>Agentic AI</Link>
          <Link to="/marine-data" style={linkStyle}>Marine Data</Link>
          <Link to="/field-intelligence" style={linkStyle}>Field Intelligence</Link>
          <Link to="/use-cases" style={linkStyle}>Use Cases</Link>
        </div>

        {/* 3. Secondary Navigation Column with Pink Control Room Portal Link */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/technology" style={linkStyle}>Technology</Link>
          <Link to="/about" style={linkStyle}>About MARIS</Link>
          <Link to="/contact" style={linkStyle}>Contact / Demo</Link>
          <Link to="/portal/login" style={pinkLinkStyle}>Control Room Portal ➔</Link>
        </div>

        {/* 4. Far Right Newsletter Subscription Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifySelf: isMobile ? 'start' : 'end', maxWidth: '380px', width: '100%', boxSizing: 'border-box' }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#000000',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Stay close to the edge
          </h3>

          <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
            Occasional insights on the ideas, people, and systems moving marine intelligence forward
          </p>

          {/* Email Input Box with Corner Arrow ↳ */}
          <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', marginTop: '8px', boxSizing: 'border-box' }}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 40px 12px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.25)',
                color: '#000000',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              aria-label="Submit email"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#000000',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ↳
            </button>
          </form>

          {/* Social Icons Row (X, in, ●●) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ color: '#000000', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
              X
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#000000', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
              in
            </a>
            <Link to="/" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#000000', borderRadius: '50%' }} />
              <div style={{ width: '8px', height: '8px', backgroundColor: '#000000', borderRadius: '50%' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Giant "maris" Typography (Full Width at Bottom) */}
      <div style={{ width: '100%', overflow: 'hidden', marginTop: '40px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(5rem, 22vw, 30rem)',
            fontWeight: 500,
            color: '#000000',
            lineHeight: 0.8,
            letterSpacing: '-0.05em',
            margin: 0,
            padding: 0,
            width: '100%',
            whiteSpace: 'nowrap',
            transform: 'translateX(-1%)',
            userSelect: 'none',
          }}
        >
          maris
        </h1>
      </div>

      {/* Copyright Line */}
      <div style={{ marginTop: '24px', color: 'rgba(0, 0, 0, 0.45)', fontSize: '0.8rem' }}>
        © MARIS 2026 — SIH26176 Marine Wildlife Intelligence
      </div>

      {/* SHORT-DURATION SUBSCRIPTION CONFIRMATION POPUP TOAST (AESTHETIC LIGHT MODE) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: isMobile ? '16px' : '32px',
              right: isMobile ? '16px' : '32px',
              left: isMobile ? '16px' : 'auto',
              zIndex: 9999,
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: '20px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              maxWidth: isMobile ? 'calc(100vw - 32px)' : '440px',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(250, 46, 223, 0.1)',
                color: '#fa2edf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={22} />
            </motion.div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 500, color: '#000000' }}>
                Subscribed!
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)', marginTop: '2px', wordBreak: 'break-all', lineHeight: 1.4 }}>
                Subscribed: <span style={{ color: '#000000', fontWeight: 600 }}>{subscribedEmail}</span>
              </div>
            </div>

            <button
              onClick={() => setShowToast(false)}
              aria-label="Close notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(0, 0, 0, 0.35)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s ease',
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

const linkStyle: React.CSSProperties = {
  color: '#000000',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
};

const pinkLinkStyle: React.CSSProperties = {
  color: '#fa2edf',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 700,
  transition: 'opacity 0.2s ease',
};
