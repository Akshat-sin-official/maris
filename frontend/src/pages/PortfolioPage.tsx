import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

interface IncidentCase {
  id: string;
  code: string;
  title: string;
  location: string;
  coordinates: string;
  category: string;
  priority: 'P0 // HIGH' | 'P1 // MEDIUM' | 'P2 // ROUTINE';
  confidence: string;
  status: string;
  items: Array<{ species: string; commodity: string; quantity: string }>;
  whyFlagged: string[];
}

export const PortfolioPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const cases: IncidentCase[] = [
    {
      id: '1',
      code: 'CASE #MARIS-00124',
      title: 'Offshore Illegal Seahorse & Dugong Multi-Item Seizure',
      location: 'Gulf of Mannar // Marine Sanctuary Zone B',
      coordinates: '9.2140° N, 79.1670° E',
      category: 'Species Trade',
      priority: 'P0 // HIGH',
      confidence: '84% AI Confidence',
      status: 'UNDER VERIFICATION',
      items: [
        { species: 'Hippocampus erectus (Lined Seahorse)', commodity: 'Dried Taxonomic Specimens', quantity: '450 units' },
        { species: 'Dugong dugon (Sea Cow)', commodity: 'Whole Intact Specimen', quantity: '2 adults' },
        { species: 'Chelonia mydas (Green Sea Turtle)', commodity: 'Harvested Eggs & Shells', quantity: '180 eggs' },
      ],
      whyFlagged: [
        '+22 Same species as previous incidents in Zone B',
        '+19 Location overlaps historical illegal corridor',
        '+16 Commodity quantity exceeds standard anomaly threshold',
      ],
    },
    {
      id: '2',
      code: 'CASE #MARIS-00189',
      title: 'Zero-Signal Offshore IUU Trawling & GPS Tampering',
      location: 'Andaman Sea Corridor // Zone 4 Zero-Cellular',
      coordinates: '11.6680° N, 92.7370° E',
      category: 'IUU Fishing',
      priority: 'P0 // HIGH',
      confidence: '92% AI Confidence',
      status: 'VERIFIED & ACTIONED',
      items: [
        { species: 'Thunnus albacares (Yellowfin Tuna)', commodity: 'Unreported Catch', quantity: '14 metric tons' },
        { species: 'Carcharhinus falciformis (Silky Shark)', commodity: 'Finning Specimen', quantity: '35 units' },
      ],
      whyFlagged: [
        '+28 AIS Transponder blackout detected',
        '+21 Coordinates match recurring smuggling corridor',
        '+18 Vessel profile matched against historical seizures',
      ],
    },
    {
      id: '3',
      code: 'CASE #MARIS-00215',
      title: 'Protected Reef Sea Turtle Egg Poaching & Night Raid',
      location: 'Lakshadweep Atoll // Coral Protection Zone',
      coordinates: '10.5626° N, 72.6420° E',
      category: 'Coastal Checkpoint',
      priority: 'P1 // MEDIUM',
      confidence: '78% AI Confidence',
      status: 'SCREENING',
      items: [
        { species: 'Eretmochelys imbricata (Hawksbill Turtle)', commodity: 'Freshly Harvested Eggs', quantity: '320 eggs' },
      ],
      whyFlagged: [
        '+24 Night time thermal camera hit',
        '+15 Nesting sanctuary proximity match',
      ],
    },
    {
      id: '4',
      code: 'CASE #MARIS-00267',
      title: 'Illegal Sea Cucumber Trapping in Marine Sanctuary',
      location: 'Palk Bay Coastal Checkpoint #14',
      coordinates: '9.8520° N, 79.1120° E',
      category: 'Species Trade',
      priority: 'P0 // HIGH',
      confidence: '89% AI Confidence',
      status: 'ASSIGNED TO OFFICER',
      items: [
        { species: 'Holothuria scabra (Golden Sea Cucumber)', commodity: 'Processed Beche-de-mer', quantity: '1,200 kg' },
      ],
      whyFlagged: [
        '+26 High commercial value target species',
        '+20 Route overlaps historical Tamil Nadu export channel',
      ],
    },
  ];

  const filteredCases = activeFilter === 'ALL'
    ? cases
    : cases.filter(c => c.category === activeFilter || c.priority.includes(activeFilter));

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Page Header */}
      <section style={{ padding: '80px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              INCIDENT INTELLIGENCE & CASE REPOSITORY
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontWeight: 500, color: '#000000', marginBottom: '20px' }}>
            Multi-Item Seizures & GIS Corridor Matches
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'rgba(0,0,0,0.72)', maxWidth: '720px', lineHeight: 1.6 }}>
            Explore verified wildlife-crime incidents captured via offline field reporting, enriched with AI species identification, and cross-matched against historical poaching corridors.
          </p>
        </motion.div>
      </section>

      {/* Filter Tabs */}
      <section style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {['ALL', 'Species Trade', 'IUU Fishing', 'Coastal Checkpoint', 'P0 // HIGH'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilter === tab ? '1px solid #000000' : '1px solid rgba(0,0,0,0.12)',
                backgroundColor: activeFilter === tab ? '#000000' : '#ffffff',
                color: activeFilter === tab ? '#ffffff' : '#000000',
                transition: 'all 0.2s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Incident Case Cards Grid */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredCases.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                padding: '36px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Card Header Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: '#fa2edf', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' }}>
                    {item.priority}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(0,0,0,0.6)', fontFamily: 'monospace' }}>
                    {item.code}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#000000', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.06)', padding: '4px 10px', borderRadius: '4px' }}>
                    {item.confidence}
                  </span>
                  <span style={{ fontWeight: 600, color: '#000000', backgroundColor: 'rgba(0,0,0,0.06)', padding: '4px 10px', borderRadius: '4px' }}>
                    STATUS: {item.status}
                  </span>
                </div>
              </div>

              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#000000', marginBottom: '12px' }}>
                {item.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'rgba(0,0,0,0.65)', marginBottom: '24px' }}>
                <MapPin size={16} color="#fa2edf" />
                <span>{item.location}</span>
                <span style={{ fontFamily: 'monospace', color: 'rgba(0,0,0,0.4)', marginLeft: '8px' }}>({item.coordinates})</span>
              </div>

              {/* Multi-Item Seizure Table */}
              <div style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', letterSpacing: '0.05em' }}>
                  MULTI-ITEM EVIDENCE BREAKDOWN
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.items.map((sub, i) => (
                    <div key={i} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <strong style={{ color: '#000' }}>{sub.species}</strong> — <span style={{ color: 'rgba(0,0,0,0.65)' }}>{sub.commodity}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: '#fa2edf', fontFamily: 'monospace' }}>{sub.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Flagged Box */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  WHY WAS THIS FLAGGED? (EXPLAINABLE AI REASONING)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {item.whyFlagged.map((reason, rIdx) => (
                    <div key={rIdx} style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#fa2edf', fontWeight: 700 }}>•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
