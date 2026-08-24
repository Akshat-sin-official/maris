import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PortfolioSectionProps {
  showFilters?: boolean;
  showPageHeader?: boolean;
}

interface IncidentCase {
  id: string;
  name: string;
  subtitle: string;
  categories: string[];
  description: string;
  badge?: string;
  imageUrl: string;
  url: string;
}

const CATEGORIES = ['All', 'Offline Sync', 'Species AI', 'Tipster Protect', 'GIS Corridor'];

const CASES: IncidentCase[] = [
  {
    id: 'case-1',
    name: 'Sea Turtle & Reef Protection',
    subtitle: 'OFFSHORE POACHING // ZERO SIGNAL',
    categories: ['Offline Sync'],
    description: 'Offline-first capture engine saving evidence locally into encrypted SQLite, auto-syncing when back in range.',
    badge: 'P0 // OFFLINE SYNC',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    url: '/field-intelligence',
  },
  {
    id: 'case-2',
    name: 'Illegal Seahorse & Dugong Trade',
    subtitle: 'TAXONOMIC FORENSICS // AI SIGNAL',
    categories: ['Species AI'],
    description: 'AI-assisted species identification generating explainable confidence signals ("Possible Seahorse - 84%").',
    badge: 'AI CONFIDENCE 84%',
    imageUrl: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=1200&q=80',
    url: '/agents',
  },
  {
    id: 'case-3',
    name: 'Confidential Source Protection',
    subtitle: 'CONFIDENTIAL TIPSTER // ANONYMOUS',
    categories: ['Tipster Protect'],
    description: 'Pseudonymous 10-digit Tipster ID + JWT End-to-End Encryption protecting informants from identity exposure.',
    badge: 'ANONYMOUS TIP',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    url: '/marine-data',
  },
  {
    id: 'case-4',
    name: 'Multi-Incident Corridor Mapping',
    subtitle: 'PATTERNS // HISTORICAL MATCH',
    categories: ['GIS Corridor'],
    description: 'Historical corridor pattern matching linking recurring wildlife crimes across protected marine zones.',
    badge: 'HISTORICAL MATCH 3x',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    url: '/intelligence',
  },
  {
    id: 'case-5',
    name: 'Blast Fishing & Acoustic Monitoring',
    subtitle: 'DEEP WATER EXPLOSIVES // SANCTUARY CRISIS',
    categories: ['GIS Corridor', 'Species AI'],
    description: 'Acoustic anomaly telemetry and satellite bathymetry detecting illegal blast fishing inside reef sanctuaries.',
    badge: 'CRIME SIGNAL // ACOUSTIC 94%',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    url: '#',
  },
  {
    id: 'case-6',
    name: 'Dark Fleet & AIS Spoof Tracking',
    subtitle: 'AIS DISABLED // EXCLUSIVE ECONOMIC ZONE',
    categories: ['GIS Corridor'],
    description: 'AI corridor trajectory matching identifying dark fleet poaching vessels operating inside protected waters.',
    badge: 'DARK FLEET // DETECTED',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    url: '#',
  },
  {
    id: 'case-7',
    name: 'Cetacean Bycatch & Driftnet Alerts',
    subtitle: 'BIO-ACOUSTIC TAGGING // CETACEAN SAFETY',
    categories: ['Species AI'],
    description: 'Real-time bio-acoustic AI classification tagging dolphin and whale pods approaching illegal driftnet zones.',
    badge: 'SPECIES ALERT // 92%',
    imageUrl: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=1200&q=80',
    url: '#',
  },
  {
    id: 'case-8',
    name: 'Coastal Trawling & Nursery Incursion',
    subtitle: 'SHALLOW WATER INTRUSION // HABITAT PROTECTION',
    categories: ['Offline Sync', 'Tipster Protect'],
    description: 'Field enforcement logs documenting unauthorized bottom trawling incursions destroying near-shore marine habitats.',
    badge: 'P1 // FIELD DISPATCH',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    url: '#',
  },
];

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  showFilters = true,
  showPageHeader = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredCases = selectedCategory === 'All'
    ? CASES
    : CASES.filter((c) => c.categories.includes(selectedCategory));

  const visibleCases = filteredCases.slice(0, 4);

  return (
    <section
      id="portfolio"
      style={{
        position: 'relative',
        padding: '120px 0 0 0',
        width: '100%',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header Title with Scroll Effect */}
      {showPageHeader && (
        <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              color: 'rgba(0, 0, 0, 0.6)',
              marginBottom: '24px',
            }}
          >
            Building Marine Intelligence since 2026.
          </p>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#000000',
              maxWidth: '960px',
              margin: '0 auto',
              letterSpacing: '-0.01em',
            }}
          >
            <span>Conviction before consensus is the only edge that matters. Every case here is proof of </span>
            <span style={{ opacity: 0.35 }}>that. We build outliers.</span>
          </h2>
        </div>
      )}

      {/* Filter Pills */}
      {showFilters && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '48px',
            padding: '0 24px',
          }}
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  border: isActive
                    ? '1px solid rgba(0, 0, 0, 0.6)'
                    : '1px solid rgba(0, 0, 0, 0.15)',
                  backgroundColor: isActive
                    ? 'rgba(0, 0, 0, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: isActive ? '#000000' : 'rgba(0, 0, 0, 0.7)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* FULL EDGE-TO-EDGE 2-COLUMN CARDS GRID (SIDE BY SIDE ON MOBILE & DESKTOP) */}
      <motion.div
        layout
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 50vw)',
          width: '100vw',
          margin: 0,
          padding: 0,
        }}
      >
        <AnimatePresence>
          {visibleCases.map((item: IncidentCase) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                width: '50vw',
              }}
            >
              <Link
                to={item.url}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
              {/* Image Container with Responsive Height for Mobile 2-Column Side by Side View */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: isMobile ? '240px' : '520px',
                  backgroundColor: '#f5f5f7',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Background Marine Image */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.85,
                    filter: 'contrast(1.02) brightness(0.95)',
                    transition: 'transform 0.6s ease',
                  }}
                />

                {/* Category Pills Overlay at Top Left inside Card */}
                <div
                  style={{
                    position: 'absolute',
                    top: isMobile ? '10px' : '24px',
                    left: isMobile ? '10px' : '24px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  {item.categories.map((cat) => (
                    <span
                      key={cat}
                      style={{
                        padding: isMobile ? '3px 8px' : '6px 14px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.88)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        color: '#000000',
                        fontSize: isMobile ? '0.6rem' : '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Centered Case Title Header */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    padding: isMobile ? '0 12px' : '0 36px',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: isMobile ? '0.62rem' : '0.75rem',
                      fontWeight: 700,
                      color: '#fa2edf',
                      letterSpacing: '0.08em',
                      marginBottom: isMobile ? '2px' : '8px',
                    }}
                  >
                    {item.subtitle}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: isMobile ? '1.05rem' : 'clamp(1.8rem, 2.8vw, 2.4rem)',
                      fontWeight: 500,
                      color: '#ffffff',
                      textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                      lineHeight: 1.15,
                      margin: 0,
                    }}
                  >
                    {item.name}
                  </h3>
                </div>

                {/* Dark Vignette Overlay for Title Readability */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Card Footer Text */}
              <div
                style={{
                  padding: isMobile ? '12px 14px' : '24px 32px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '6px' : '16px',
                  minHeight: isMobile ? 'auto' : '84px',
                  boxSizing: 'border-box',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <p style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: isMobile ? '0.75rem' : '0.95rem', margin: 0, lineHeight: 1.35, maxWidth: isMobile ? '100%' : '80%' }}>
                  {item.description}
                </p>

                {item.badge && (
                  <span
                    style={{
                      color: '#fa2edf',
                      fontSize: isMobile ? '0.65rem' : '0.8rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Bottom CTA */}
      <div
        style={{
          padding: '60px 24px 100px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Link
          to="/problem"
          className="btn-frontier"
        >
          See all incident cases
        </Link>
      </div>
    </section>
  );
};
