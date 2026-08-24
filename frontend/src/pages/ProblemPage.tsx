import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, HelpCircle, Compass, Clock, Database, Eye } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const ProblemPage: React.FC = () => {
  const challenges = [
    {
      num: '01',
      title: 'Data Fragmentation',
      desc: 'Relevant information is distributed across multiple marine, meteorological, geospatial and Earth Observation sources.',
      icon: Layers,
    },
    {
      num: '02',
      title: 'Complex Questions',
      desc: 'Users don\'t ask: "Give me dataset X." They ask: "Is it safe to go tomorrow morning?"',
      icon: HelpCircle,
    },
    {
      num: '03',
      title: 'Spatial Reasoning',
      desc: 'Recommendations depend on precise location, proximity, marine boundaries, and localized environmental conditions.',
      icon: Compass,
    },
    {
      num: '04',
      title: 'Temporal Reasoning',
      desc: 'MARIS has to consider real-time current conditions, forecasts, historical trends, and rapidly changing hazards.',
      icon: Clock,
    },
    {
      num: '05',
      title: 'Data Volume',
      desc: 'Marine information is too large, complex, and heterogeneous for simple manual retrieval by operators.',
      icon: Database,
    },
    {
      num: '06',
      title: 'Explainability',
      desc: 'Users need to understand the underlying evidence and reasoning behind why a recommendation was produced.',
      icon: Eye,
    },
  ];

  const incidentNews = [
    {
      date: 'AUG 24, 2026',
      category: 'OFFSHORE POACHING',
      title: 'Sea Turtle & Coral Reef Habitat Incursion',
      summary: 'Offline field capture engines logged 14 unregistered vessel coordinates operating inside protected sanctuary waters. Absence of real-time spatial correlation delayed ranger dispatch by 18 hours.',
      status: 'P0 // UNRESOLVED DISPATCH',
    },
    {
      date: 'AUG 18, 2026',
      category: 'ILLEGAL SPECIES TRADE',
      title: 'Seahorse & Dugong Contraband Seizure Signal',
      summary: 'Tipster mobile report submitted photo evidence of harvested seahorse contraband. Species identification required manual taxonomic audit due to lack of automated visual AI confidence tags.',
      status: 'CONFIDENCE 84% // MANUAL AUDIT',
    },
    {
      date: 'AUG 12, 2026',
      category: 'ACOUSTIC ANOMALY',
      title: 'Blast Fishing Explosives in Reef Sanctuary',
      summary: 'Hydrophone acoustic telemetry detected impulse sound signatures consistent with blast fishing explosives inside nursery reefs. Signal unverified due to disconnected GIS bathymetry feeds.',
      status: 'CRIME SIGNAL // UNVERIFIED',
    },
    {
      date: 'JUL 29, 2026',
      category: 'AIS SPOOFING',
      title: 'Dark Fleet Intrusion in Exclusive Economic Zone',
      summary: 'Vessel transponder signals disabled for 12 consecutive hours near sanctuary border. Spatial corridor trajectory matching was unavailable to control room dispatchers.',
      status: 'DARK FLEET // DETECTED',
    },
    {
      date: 'JUL 15, 2026',
      category: 'CETACEAN SAFETY',
      title: 'Whale Pod Proximity to Illegal Driftnet Arrays',
      summary: 'Bio-acoustic buoy recorded dolphin and whale vocalization clusters within 2 nautical miles of commercial driftnet lines. Lacked automated multi-agent hazard advisories.',
      status: 'SPECIES ALERT // DELAYED',
    },
    {
      date: 'JUN 30, 2026',
      category: 'HABITAT DEGRADATION',
      title: 'Coastal Bottom Trawling Habitat Intrusion',
      summary: 'Near-shore bottom trawling incursions destroyed fragile benthic seagrass beds. Local tipsters reported incursions but lacked pseudonymous source protection tools.',
      status: 'P1 // FIELD DISPATCH',
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              THE MARINE DATA CHALLENGE
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.1, marginBottom: '20px', maxWidth: '850px' }}>
            The problem is not a lack of marine data.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'rgba(0, 0, 0, 0.72)', maxWidth: '750px', lineHeight: 1.6, margin: 0 }}>
            It is the difficulty of turning fragmented marine information into timely, contextual and explainable decisions.
          </p>
        </motion.div>
      </section>

      {/* Main Data Fragmentation Visualization */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            DATA LANDSCAPE VS. DECISION FRAGMENTATION
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#000000', margin: 0 }}>
            Fragmented Input Sources → Unclear Action
          </h2>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '36px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {['Satellite Data', 'Weather Feeds', 'Oceanographic Data', 'GIS Maps', 'Marine Advisories', 'Field Observations'].map((src, i) => (
              <div key={i} style={{ padding: '14px', backgroundColor: '#f8f9fa', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#000000', textAlign: 'center' }}>
                {src}
              </div>
            ))}
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              KEY FRAGMENTATION BOTTLENECKS
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem', color: 'rgba(0,0,0,0.8)' }}>
              <div>• Disparate formats (Raster, Vector, Tabular)</div>
              <div>• Isolated providers (IMD, INCOIS, Copernicus)</div>
              <div>• Disconnected timescales (Real-time vs Forecasts)</div>
              <div>• Ambiguous spatial projection bounds</div>
            </div>
          </div>

          <div style={{ padding: '16px 24px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '6px', fontWeight: 600, fontSize: '0.95rem', display: 'inline-block' }}>
            RESULT: Fragmented decision-making & delayed operational response
          </div>
        </div>
      </section>

      {/* Six Core Challenges List */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            CORE BOTTLENECKS
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', margin: 0 }}>
            Six Bottlenecks in Marine Intelligence
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {challenges.map((c, idx) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{
                  padding: '32px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>
                      CHALLENGE {c.num}
                    </span>
                    <Icon size={20} color="#000000" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#000000', marginBottom: '10px' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.7)', lineHeight: 1.5, margin: 0 }}>
                    {c.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Flat UI News Incident Feed Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
            INCIDENT REPORTS & FIELD BRIEFINGS
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', margin: 0 }}>
            Recent Marine Crime & Ecological Incidents
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(0,0,0,0.7)', marginTop: '8px', margin: '8px 0 0 0' }}>
            Real-world case examples illustrating data fragmentation and enforcement challenges across coastal zones.
          </p>
        </div>

        {/* News Items Flat List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {incidentNews.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              style={{
                padding: '32px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                alignItems: 'start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>
                    {item.date}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    // {item.category}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#000000', margin: 0 }}>
                  {item.title}
                </h3>
              </div>

              <div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'rgba(0,0,0,0.72)', lineHeight: 1.6 }}>
                  {item.summary}
                </p>
                <span style={{ display: 'inline-block', backgroundColor: '#f8f9fa', border: '1px solid rgba(0,0,0,0.08)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.6)', fontFamily: 'monospace' }}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ padding: '80px 24px 100px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', marginBottom: '16px' }}>
            Transforming Fragmented Data into Explainable Action
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(0,0,0,0.7)', marginBottom: '32px', lineHeight: 1.6 }}>
            Discover how MARIS connects multi-source satellite feeds, agentic AI reasoning, and offline field intelligence into one unified platform.
          </p>

          <Link
            to="/intelligence"
            className="btn-frontier"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '16px 36px',
              borderRadius: '9999px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>See the MARIS Intelligence Layer</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
