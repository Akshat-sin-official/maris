import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import { INSIGHTS } from '../data/insightsData';
import { CtaSection } from '../components/CtaSection';

export const InsightsPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const tags = ['ALL', 'UN News', 'Reuters News', 'Nature Journal', 'TechCrunch AI', 'Thesis', 'Manifesto'];

  const filteredInsights = INSIGHTS.filter((item) => {
    const matchesTag = selectedTag === 'ALL' || item.tag === selectedTag;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Header */}
      <section style={{ padding: '80px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              RESEARCH, PAPERS & GLOBAL NEWS
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontWeight: 500, color: '#000000', marginBottom: '20px' }}>
            Perspectives from the AI Frontier®
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'rgba(0,0,0,0.72)', maxWidth: '720px', lineHeight: 1.6 }}>
            Explore published research, technological theses, and global news coverage on marine AI surveillance, offline-first intelligence, and ocean wildlife conservation.
          </p>
        </motion.div>
      </section>

      {/* Search & Tag Filter Bar */}
      <section style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '32px' }}>
          {/* Tag Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedTag === tag ? '1px solid #000000' : '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: selectedTag === tag ? '#000000' : '#ffffff',
                  color: selectedTag === tag ? '#ffffff' : '#000000',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Bar Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={18} color="rgba(0,0,0,0.4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: '9999px',
                border: '1px solid rgba(0,0,0,0.15)',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#f8f9fa',
              }}
            />
          </div>
        </div>
      </section>

      {/* Grid of Filtered Insights */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          layout
          className="insights-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <AnimatePresence>
            {filteredInsights.map((item, idx) => (
              <motion.a
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                href={item.url}
                target={item.url.startsWith('http') ? '_blank' : '_self'}
                rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="insights-card glass-card"
                style={{
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s ease',
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
                        border: '1px solid rgba(250, 46, 223, 0.2)',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
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
      </section>

      <CtaSection />
    </div>
  );
};
