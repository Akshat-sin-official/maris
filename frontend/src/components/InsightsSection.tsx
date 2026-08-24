import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { INSIGHTS } from '../data/insightsData';

export const InsightsSection: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleInsights = showAll ? INSIGHTS : INSIGHTS.slice(0, 6);

  return (
    <section
      id="insights"
      style={{
        padding: '120px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ marginBottom: '56px' }}>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            color: 'rgba(0, 0, 0, 0.65)',
            marginBottom: '12px',
          }}
        >
          Latest Insights
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 500,
            color: '#000000',
            margin: 0,
          }}
        >
          Perspectives from the AI Frontier®
        </h2>
      </div>

      <motion.div
        layout
        className="insights-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        <AnimatePresence>
          {visibleInsights.map((item, idx) => (
            <motion.a
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              href={item.url}
              target={item.url.startsWith('http') ? '_blank' : '_self'}
              rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="insights-card glass-card"
              style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px',
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    fontSize: '0.8rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <span
                    style={{
                      color: '#fa2edf',
                      backgroundColor: 'rgba(250, 46, 223, 0.08)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}
                  >
                    {item.tag}
                  </span>
                  <span>{item.date} • {item.readTime}</span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: '#000000',
                    lineHeight: 1.4,
                    marginBottom: '16px',
                  }}
                >
                  {item.title}
                </h3>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'rgba(0, 0, 0, 0.65)',
                  fontSize: '0.875rem',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  paddingTop: '16px',
                }}
              >
                <span>By {item.author}</span>
                <ArrowUpRight size={18} color="#000000" />
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* See More Toggle Button */}
      {INSIGHTS.length > 6 && (
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-frontier"
            style={{
              borderRadius: '9999px',
              padding: '14px 36px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showAll ? 'Show less' : `See more (${INSIGHTS.length - 6} additional insights)`}
          </button>
        </div>
      )}
    </section>
  );
};
