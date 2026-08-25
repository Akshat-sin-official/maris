import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const checkBackgroundBrightness = () => {
      // Force white navbar elements over Hero section on homepage
      if (location.pathname === '/' && window.scrollY < window.innerHeight * 0.85) {
        setIsDarkBg(true);
        return;
      }

      const sampleX = 60;
      const sampleY = 36;
      const elements = document.elementsFromPoint(sampleX, sampleY);

      for (const el of elements) {
        if (el.tagName === 'HEADER' || el.closest('header')) continue;

        const computedBg = window.getComputedStyle(el).backgroundColor;
        if (computedBg && computedBg !== 'transparent' && computedBg !== 'rgba(0, 0, 0, 0)') {
          const rgbMatch = computedBg.match(/\d+/g);
          if (rgbMatch && rgbMatch.length >= 3) {
            const r = parseInt(rgbMatch[0], 10);
            const g = parseInt(rgbMatch[1], 10);
            const b = parseInt(rgbMatch[2], 10);
            const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
            setIsDarkBg(brightness < 160);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', checkBackgroundBrightness, { passive: true });
    checkBackgroundBrightness();
    const timer = setTimeout(checkBackgroundBrightness, 100);

    return () => {
      window.removeEventListener('scroll', checkBackgroundBrightness);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeColor = menuOpen ? '#000000' : (isDarkBg ? '#ffffff' : '#000000');

  const navColumn1 = [
    { name: 'Problem', path: '/problem' },
    { name: 'Intelligence', path: '/intelligence' },
    { name: 'Agentic AI', path: '/agents' },
    { name: 'Marine Data', path: '/marine-data' },
    { name: 'Field Intelligence', path: '/field-intelligence' },
    { name: 'Use Cases', path: '/use-cases' },
  ];

  const navColumn2 = [
    { name: 'Technology', path: '/technology' },
    { name: 'About MARIS', path: '/about' },
    { name: 'Contact / Demo', path: '/contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      {/* Defined / MARIS Platform Logo */}
      <Link
        to="/"
        onClick={() => setMenuOpen(false)}
        aria-label="MARIS Platform Logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          pointerEvents: 'auto',
          color: activeColor,
          zIndex: 101,
          transition: 'color 0.3s ease',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 500,
            color: activeColor,
            letterSpacing: '0.02em',
            transition: 'color 0.3s ease',
          }}
        >
          .maris
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto', zIndex: 101 }}>
        {/* Direct Link to Public Tipster Portal */}
        <Link
          to="/report-tip"
          className="desktop-only-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            borderRadius: '9999px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'inline-block' }} />
          <span>REPORT TIP</span>
        </Link>

        {/* Direct Link to Operational Control Room Portal Login (Desktop Only) */}
        <Link
          to="/portal/login"
          className="desktop-only-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            borderRadius: '9999px',
            backgroundColor: menuOpen ? 'rgba(0,0,0,0.06)' : (isDarkBg ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)'),
            backdropFilter: 'blur(12px)',
            border: '1px solid ' + (menuOpen ? 'rgba(0,0,0,0.12)' : (isDarkBg ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)')),
            color: activeColor,
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
          <span>CONTROL ROOM PORTAL</span>
        </Link>

        {/* Modern Minimalist Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            backgroundColor: menuOpen ? '#ffffff' : (isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'),
            backdropFilter: 'blur(12px)',
            border: '1px solid ' + (menuOpen ? 'rgba(0,0,0,0.12)' : (isDarkBg ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')),
            borderRadius: '9999px',
            cursor: 'pointer',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: activeColor,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: menuOpen ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: activeColor,
            }}
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </span>

          {menuOpen ? (
            <X size={18} color="#000000" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 5px)', gap: '3px' }}>
              <div style={{ width: '5px', height: '5px', backgroundColor: activeColor, borderRadius: '50%', transition: 'background-color 0.3s ease' }} />
              <div style={{ width: '5px', height: '5px', backgroundColor: activeColor, borderRadius: '50%', transition: 'background-color 0.3s ease' }} />
              <div style={{ width: '5px', height: '5px', backgroundColor: activeColor, borderRadius: '50%', transition: 'background-color 0.3s ease' }} />
              <div style={{ width: '5px', height: '5px', backgroundColor: activeColor, borderRadius: '50%', transition: 'background-color 0.3s ease' }} />
            </div>
          )}
        </button>
      </div>

      {/* Premium Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#ffffff',
              zIndex: 99,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '100px 24px 40px',
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
          >
            <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
              {/* Prominent Control Room Portal Card inside Drawer */}
              <div style={{ marginBottom: '32px' }}>
                <Link
                  to="/portal/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-body)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1.5px solid rgba(0, 0, 0, 0.12)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', letterSpacing: '0.02em', color: '#000000' }}>CONTROL ROOM PORTAL</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>Role-Authenticated Operational Access</div>
                    </div>
                  </div>
                  <span style={{ color: '#fa2edf', fontWeight: 700, fontSize: '1.2rem' }}>➔</span>
                </Link>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '48px',
                  alignItems: 'start',
                }}
              >
                {/* Column 1: Core Navigation */}
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.4)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '24px',
                    }}
                  >
                    PLATFORM & ARCHITECTURE
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {navColumn1.map((item, idx) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.04 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setMenuOpen(false)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              textDecoration: 'none',
                              color: '#000000',
                              fontSize: '1.25rem',
                              fontWeight: 600,
                              fontFamily: 'var(--font-body)',
                              transition: 'opacity 0.2s ease',
                            }}
                          >
                            <span>{item.name}</span>
                            {isActive && (
                              <span style={{ width: '6px', height: '6px', backgroundColor: '#000000', borderRadius: '50%', display: 'inline-block' }} />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Overview & Contact */}
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.4)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '24px',
                    }}
                  >
                    COMPANY & DEMOS
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {navColumn2.map((item, idx) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: (idx + 6) * 0.04 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setMenuOpen(false)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              textDecoration: 'none',
                              color: '#000000',
                              fontSize: '1.25rem',
                              fontWeight: 600,
                              fontFamily: 'var(--font-body)',
                              transition: 'opacity 0.2s ease',
                            }}
                          >
                            <span>{item.name}</span>
                            {isActive && (
                              <span style={{ width: '6px', height: '6px', backgroundColor: '#000000', borderRadius: '50%', display: 'inline-block' }} />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Drawer Footer Bar */}
            <div
              style={{
                maxWidth: '1200px',
                width: '100%',
                margin: '60px auto 0',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                paddingTop: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: 'rgba(0, 0, 0, 0.5)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div>© MARIS 2026 — SIH26176 Marine Wildlife Intelligence</div>
              <div>Press <kbd style={{ padding: '2px 6px', backgroundColor: '#f5f5f7', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>ESC</kbd> to close</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
