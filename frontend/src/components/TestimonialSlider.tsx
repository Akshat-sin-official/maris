import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../data/testimonialsData';

export const TestimonialSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              minHeight: '200px',
              justifyContent: 'center',
            }}
          >
            {/* Prominent Organization Logo + Org Name Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <img
                src={current.companyLogo}
                alt={current.author}
                style={{
                  maxHeight: '40px',
                  maxWidth: '160px',
                  objectFit: 'contain',
                  filter: 'grayscale(100%) opacity(0.75)',
                  transition: 'filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%) opacity(1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%) opacity(0.75)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
              <div style={{ borderLeft: '1px solid rgba(0, 0, 0, 0.15)', paddingLeft: '16px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'rgba(0, 0, 0, 0.85)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {current.author}
                </span>
              </div>
            </div>

            {/* Quote */}
            <blockquote
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
                lineHeight: 1.6,
                color: '#000000',
                fontWeight: 500,
                fontStyle: 'normal',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              "{current.quote}"
            </blockquote>

            {/* Author info */}
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', color: '#000000', margin: 0 }}>
                {current.author}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.65)', margin: '4px 0 0' }}>
                {current.role}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Pagination Indicators */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: idx === currentIndex ? '#000000' : 'rgba(0, 0, 0, 0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={prevSlide}
              aria-label="Previous quote"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next quote"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
