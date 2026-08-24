import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '600px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(250,46,223,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Compass size={32} color="#fa2edf" />
        </div>

        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
          404 — OUT OF BOUNDS
        </span>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', color: '#000000', margin: '0 0 16px 0', lineHeight: 1.1 }}>
          Lost beyond the map?
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6, marginBottom: '36px' }}>
          The page you're looking for is outside the current MARIS route.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
          <Link
            to="/"
            className="btn-frontier"
            style={{ backgroundColor: '#000000', color: '#ffffff', padding: '14px 32px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Home size={18} />
            <span>Return Home</span>
          </Link>

          <Link
            to="/intelligence"
            className="btn-frontier"
            style={{ backgroundColor: '#ffffff', color: '#000000', padding: '14px 32px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Explore MARIS</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
