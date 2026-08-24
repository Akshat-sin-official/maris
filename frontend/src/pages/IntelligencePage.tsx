import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, CloudRain, AlertTriangle, Fish, MapPin, History, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const IntelligencePage: React.FC = () => {
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  const pipeline = [
    {
      step: 'INGEST',
      label: 'STAGE 01',
      tagline: 'Multi-Provider Data Ingestion Engine',
      desc: 'Continuous real-time ingestion of Earth Observation satellite data, IMD weather feeds, INCOIS oceanography, and field observations.',
      inputs: ['Sentinel-3 SST & Ocean Colour', 'IMD Weather & Cyclone Radar', 'INCOIS PFZ Bulletins', 'Field Ranger SQLite Logs'],
      outputs: 'Raw Heterogeneous Payload Buffer',
      codePayload: `{\n  "pipeline": "MARIS_INGEST_V1",\n  "sources": ["COPENICUS", "IMD", "INCOIS"],\n  "status": "STREAMING",\n  "latency_ms": 142\n}`,
    },
    {
      step: 'NORMALIZE',
      label: 'STAGE 02',
      tagline: 'Spatial-Temporal Standardization',
      desc: 'Standardizing coordinate projections to EPSG:4326 (WGS 84), parsing ISO 8601 UTC timestamps, and deduplicating record IDs.',
      inputs: ['Raster NetCDF Grids', 'Vector Shapefiles', 'JSON Weather Alerts', 'EXIF Camera Geotags'],
      outputs: 'Normalized GeoJSON Spatial Memory',
      codePayload: `{\n  "crs": "EPSG:4326",\n  "timestamp": "2026-08-24T12:00:00Z",\n  "spatial_index": "R-TREE_QUADKEY",\n  "dedup": true\n}`,
    },
    {
      step: 'UNDERSTAND',
      label: 'STAGE 03',
      tagline: 'Natural Language & Intent Parsing',
      desc: 'Decomposing complex user queries ("Is it safe to go tomorrow?") into spatial bounds, time windows, and target parameters.',
      inputs: ['User Natural Language Query', 'Vessel Location Coordinates', 'Operator Range Parameter'],
      outputs: 'Structured Multi-Agent Task Graph',
      codePayload: `{\n  "query_intent": "SAFETY_ASSESSMENT",\n  "time_horizon": "+24h",\n  "target_agents": ["WEATHER", "OCEAN", "GIS"]\n}`,
    },
    {
      step: 'CORRELATE',
      label: 'STAGE 04',
      tagline: 'Historical & Spatial Graph Matching',
      desc: 'Cross-matching real-time environmental anomalies against multi-year historical crime corridors, sanctuaries, and MPAs.',
      inputs: ['Normalized Live Signals', 'Historical Seizure Graph', 'WDPA Protected Area Bounds'],
      outputs: 'Spatial Overlap & Anomaly Score',
      codePayload: `{\n  "corridor_match": "GULF_OF_MANNAR_ZONE_4",\n  "historical_overlap": 0.89,\n  "sanctuary_proximity_km": 1.4\n}`,
    },
    {
      step: 'REASON',
      label: 'STAGE 05',
      tagline: 'Multi-Agent Signal Synthesis',
      desc: 'Consolidating evaluate signals from Weather, Ocean, GIS, and PFZ agents into a unified, confidence-weighted risk matrix.',
      inputs: ['Agent Evaluation Payloads', 'Confidence Weighting Rules', 'Historical Risk Metrics'],
      outputs: 'Synthesized Risk & Confidence Score',
      codePayload: `{\n  "risk_rating": "HIGH",\n  "ai_confidence": 0.84,\n  "uncertainty_flag": false,\n  "priority_score": "P0"\n}`,
    },
    {
      step: 'EXPLAIN',
      label: 'STAGE 06',
      tagline: 'Evidence Attribution & Reasoning',
      desc: 'Generating human-understandable evidence attribution detailing why a specific recommendation or risk rating was derived.',
      inputs: ['Risk Score Matrix', 'Contributing Data Factors', 'Evidence Provenance Log'],
      outputs: 'Transparent "Why Flagged?" Breakdown',
      codePayload: `{\n  "reasons": [\n    "+22 Same species as previous incidents",\n    "+19 Location overlaps illegal corridor",\n    "+16 Anomaly threshold exceeded"\n  ]\n}`,
    },
    {
      step: 'RECOMMEND',
      label: 'STAGE 07',
      tagline: 'Actionable Decision-Support Dispatch',
      desc: 'Delivering clear, role-appropriate guidance to Control Room Operators and field officers without automated enforcement overreach.',
      inputs: ['Explainable Risk Payload', 'User Role Permissions', 'Officer Location Matrix'],
      outputs: 'Actionable Decision Support Notice',
      codePayload: `{\n  "recommendation": "VERIFY_AND_DISPATCH",\n  "human_in_the_loop": true,\n  "suggested_officer": "OFFICER_14"\n}`,
    },
  ];

  const activeStage = pipeline[activeStageIdx];

  const capabilities = [
    {
      title: 'Marine Conditions',
      icon: Activity,
      bullets: ['Sea Surface Temperature (SST)', 'Significant Wave Height & Direction', 'Surface Ocean Currents', 'Sea-State & Wave Periods'],
    },
    {
      title: 'Weather Intelligence',
      icon: CloudRain,
      bullets: ['Wind Speed & Gust Trends', 'Precipitation & Rainfall Rate', 'Short & Long-term Forecasts', 'Severe Weather Alerts'],
    },
    {
      title: 'Hazard Intelligence',
      icon: AlertTriangle,
      bullets: ['Cyclone Track Trajectories', 'Lightning Activity Frequency', 'High-Wave Conditions', 'Active INCOIS/IMD Advisories'],
    },
    {
      title: 'PFZ Intelligence',
      icon: Fish,
      bullets: ['Potential Fishing Zone Data', 'Chlorophyll-a Concentrations', 'Thermal Front Dynamics', 'Contextual Harvesting Suitability'],
    },
    {
      title: 'Geospatial Intelligence',
      icon: MapPin,
      bullets: ['Maritime Boundary Geofencing', 'Marine Protected Areas (MPAs)', 'Restricted Sanctuary Zones', 'Distance & Proximity Metrics'],
    },
    {
      title: 'Historical Intelligence',
      icon: History,
      bullets: ['Historical Trend Matching', 'Recurring Hazard Overlaps', 'Multi-Year Ocean Baseline Comparison', 'Field Observation Integration'],
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              THE MARIS INTELLIGENCE LAYER
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.12, marginBottom: '24px', maxWidth: '900px' }}>
            From marine data to marine intelligence.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'rgba(0, 0, 0, 0.75)', maxWidth: '780px', lineHeight: 1.6 }}>
            MARIS does more than retrieve individual datasets. It correlates observations, understands context and produces explainable recommendations.
          </p>
        </motion.div>
      </section>

      {/* Enterprise Processing Workflow Architecture (Clean Light-Mode Stepper) */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ENTERPRISE PROCESSING WORKFLOW
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#000000', marginTop: '8px', marginBottom: '12px' }}>
              The 7-Stage Intelligence Pipeline
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.65)', maxWidth: '640px', margin: '0 auto' }}>
              Click any pipeline stage below to inspect its data ingestion specifications, transformations, and output contracts.
            </p>
          </div>

          {/* Stepper Navigation Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
            {pipeline.map((p, idx) => {
              const isActive = activeStageIdx === idx;
              return (
                <React.Fragment key={p.step}>
                  <button
                    onClick={() => setActiveStageIdx(idx)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#000000' : '#ffffff',
                      color: isActive ? '#ffffff' : '#000000',
                      border: isActive ? '1px solid #000000' : '1px solid rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? '0 6px 20px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isActive ? '#fa2edf' : 'rgba(0,0,0,0.5)', display: 'block', letterSpacing: '0.05em' }}>
                      {p.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                      {p.step}
                    </span>
                  </button>
                  {idx < pipeline.length - 1 && (
                    <ChevronRight size={16} color="rgba(0,0,0,0.25)" style={{ display: 'inline-block' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Active Stage Data Inspector Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.04)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '36px',
                alignItems: 'center',
              }}
            >
              {/* Left Column: Stage Specs */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ backgroundColor: '#fa2edf', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' }}>
                    {activeStage.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PIPELINE SPECIFICATION
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#000000', margin: '0 0 8px 0' }}>
                  {activeStage.step}
                </h3>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#fa2edf', marginBottom: '16px' }}>
                  {activeStage.tagline}
                </p>

                <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.75)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {activeStage.desc}
                </p>

                <div style={{ backgroundColor: '#f8f9fa', padding: '18px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    INPUT SOURCES & FEEDS
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {activeStage.inputs.map((inp, i) => (
                      <span key={i} style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#000', fontWeight: 500 }}>
                        {inp}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
                  <strong>STAGE OUTPUT:</strong> <span style={{ color: '#000', fontWeight: 600 }}>{activeStage.outputs}</span>
                </div>
              </div>

              {/* Right Column: Industry Data Contract Payload (Monospace Inspector) */}
              <div style={{ backgroundColor: '#000000', color: '#ffffff', borderRadius: '12px', padding: '24px', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={16} color="#fa2edf" />
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>STAGE DATA CONTRACT PAYLOAD</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#fa2edf', backgroundColor: 'rgba(250,46,223,0.15)', padding: '2px 8px', borderRadius: '4px' }}>JSON</span>
                </div>

                <pre style={{ margin: 0, color: '#ffffff', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {activeStage.codePayload}
                </pre>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Six Intelligence Capabilities Grid */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '56px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CAPABILITIES
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#000000', marginTop: '8px' }}>
            Six Dimensions of Marine Reasoning
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                style={{
                  padding: '36px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(250,46,223,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color="#fa2edf" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#000000', margin: 0 }}>
                    {c.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {c.bullets.map((b, bIdx) => (
                    <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.75)' }}>
                      <CheckCircle2 size={16} color="#000000" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Explainability Example Card */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              EXPLAINABILITY ILLUSTRATION (DEMO EXAMPLE)
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#000000', marginTop: '8px' }}>
              Why is this location considered high risk?
            </h2>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fa2edf' }}>WEATHER</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 600, color: '#000' }}>Strong winds (&gt; 35 knots)</p>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000' }}>OCEAN</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 600, color: '#000' }}>Elevated wave conditions (3.4m)</p>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fa2edf' }}>ALERT</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 600, color: '#000' }}>Active marine advisory issued</p>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333' }}>GEOSPATIAL</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 600, color: '#000' }}>Operational restriction nearby</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>MARIS SYNTHESIZED ASSESSMENT</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#fa2edf' }}>
                  HIGH RISK (HUMAN VERIFICATION RECOMMENDED)
                </div>
              </div>

              <Link to="/agents" className="btn-frontier" style={{ backgroundColor: '#000000', color: '#ffffff', padding: '12px 24px', borderRadius: '9999px', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Meet the Agents</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
