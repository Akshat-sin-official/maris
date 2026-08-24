import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Compass, AlertTriangle, Camera, TrendingUp, Anchor } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const UseCasesPage: React.FC = () => {
  const useCases = [
    {
      num: '01',
      title: 'Fisherman Safety',
      question: '"Is it safe to go to sea tomorrow morning?"',
      icon: Anchor,
      inputs: ['Wind Speed & Direction', 'Wave Height & Period', 'Tide Charts & Current Vectors', 'Active Marine Alerts', 'GPS Location'],
      output: 'Synthesized Safety Risk Index (Low / Medium / High) + Plain-Language Explanation + Emergency Action Recommendation',
    },
    {
      num: '02',
      title: 'Potential Fishing Zones (PFZ)',
      question: '"Where is the nearest suitable PFZ?"',
      icon: Compass,
      inputs: ['INCOIS PFZ Advisories', 'Thermal Front Dynamics (SST)', 'Chlorophyll Concentrations', 'Distance & Fuel Logistics', 'Hazard Alerts'],
      output: 'Contextual PFZ Location Map + Environmental Suitability Score + Safe Route Navigation Path',
    },
    {
      num: '03',
      title: 'Marine Hazard Awareness',
      question: '"Are there any cyclone or lightning alerts near me?"',
      icon: AlertTriangle,
      inputs: ['IMD Cyclone Track Feeds', 'Lightning Flash Density Mapping', 'High-Wave Coastal Bulletins', 'Vessel Location Coordinates'],
      output: 'Real-Time Proximity Alert + Severity Rating + Impact Timing Window + Shelter Harbor Map',
    },
    {
      num: '04',
      title: 'Environmental Observation',
      question: 'Offline field submission & control room correlation',
      icon: Camera,
      inputs: ['Field Ranger Photo/Video', 'EXIF GPS & Timestamp', 'Offline SQLite Local Storage', 'Automatic Sync Engine'],
      output: 'STORE → SYNC → MAP → CORRELATE → SHARE WITH AUTHORIZED USERS (Control Room Audit)',
    },
    {
      num: '05',
      title: 'Productivity Analysis',
      question: '"Why has fish productivity declined in this region?"',
      icon: TrendingUp,
      inputs: ['Historical SST Trends', 'Multi-Year Chlorophyll Data', 'Seasonal Ocean Current Changes', 'Geographic Baseline Context'],
      output: 'Analytical Trend Projection & Environmental Correlation (Presented as Analytical Interpretations, Not Causal Proof)',
    },
    {
      num: '06',
      title: 'Geofencing & Boundary Alerts',
      question: '"Am I approaching a restricted or protected marine area?"',
      icon: ShieldCheck,
      inputs: ['Real-Time Vessel GPS', 'Exclusive Economic Zone (EEZ) Bounds', 'Marine Protected Area (MPA) Lines', 'Sanctuary Geofences'],
      output: 'Proximity Warning Alarm + Distance Remaining Metric + Authorized Boundary Guidance',
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Minimalist Hero */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              OPERATIONAL USE CASES
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.1, marginBottom: '20px', maxWidth: '850px' }}>
            Built for decisions that happen in the real world.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', color: 'rgba(0, 0, 0, 0.72)', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
            MARIS addresses six core operational scenarios where complex marine data must be transformed into immediate, explainable decision support.
          </p>
        </motion.div>
      </section>

      {/* Six Use Cases Minimalist List */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '32px' }}>
          {useCases.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                style={{
                  padding: '36px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>
                      USE CASE {uc.num}
                    </span>
                    <Icon size={22} color="#000000" />
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#000000', marginBottom: '8px' }}>
                    {uc.title}
                  </h3>

                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 600, color: '#000000', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.4 }}>
                    {uc.question}
                  </p>

                  <div style={{ backgroundColor: '#f8f9fa', padding: '18px', borderRadius: '10px', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                      CORRELATED INPUT FEEDS
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {uc.inputs.map((inp, iIdx) => (
                        <span key={iIdx} style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: 'rgba(0,0,0,0.8)', fontWeight: 500 }}>
                          {inp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    EXPLAINABLE DECISION OUTPUT
                  </span>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#000000', fontWeight: 500, lineHeight: 1.5 }}>
                    {uc.output}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
