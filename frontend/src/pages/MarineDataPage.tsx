import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Waves, CloudSun, AlertCircle, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const MarineDataPage: React.FC = () => {
  const categories = [
    {
      title: 'Earth Observation',
      icon: Globe,
      items: ['Satellite-derived marine observations', 'Ocean colour Index (OCI)', 'Sea Surface Temperature (SST)', 'Chlorophyll-a concentrations'],
    },
    {
      title: 'Oceanographic Data',
      icon: Waves,
      items: ['Significant wave height & direction', 'Surface ocean currents', 'Sea-state dynamics', 'Wave period & swell energy'],
    },
    {
      title: 'Meteorological Data',
      icon: CloudSun,
      items: ['Wind speed & direction trends', 'Precipitation & rainfall intensity', 'Short & medium range weather', 'Severe gale & storm warnings'],
    },
    {
      title: 'Marine Advisories',
      icon: AlertCircle,
      items: ['Cyclone path tracking', 'Lightning density frequency', 'High-wave shoreline alerts', 'Official INCOIS/IMD advisories'],
    },
    {
      title: 'Geospatial Data',
      icon: MapPin,
      items: ['Bathymetry & maritime maps', 'Exclusive Economic Zone (EEZ)', 'Marine Protected Areas (MPA)', 'Restricted Sanctuary Boundaries'],
    },
    {
      title: 'Field Intelligence',
      icon: Camera,
      items: ['Ranger & fisherman observations', 'EXIF-tagged photos/videos', 'GPS location coordinates', 'Time & structured field notes'],
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
              DATA PROVENANCE & INTEGRATION
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.12, marginBottom: '24px', maxWidth: '900px' }}>
            The intelligence layer starts with trustworthy data.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'rgba(0, 0, 0, 0.75)', maxWidth: '780px', lineHeight: 1.6 }}>
            MARIS standardizes diverse Earth Observation, oceanographic, meteorological, and field feeds into a unified spatial-temporal data layer.
          </p>
        </motion.div>
      </section>

      {/* Six Data Categories Grid */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
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
                    {cat.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cat.items.map((item, iIdx) => (
                    <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.75)' }}>
                      <CheckCircle2 size={16} color="#000000" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Integration Adapter Architecture */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
            PROVIDER ADAPTER ARCHITECTURE
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', marginBottom: '40px' }}>
            Multi-Source Ingestion Pipeline
          </h2>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '40px 24px', fontFamily: 'monospace', fontSize: '0.95rem', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>IMD Weather</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>INCOIS PFZ</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>Copernicus Marine</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>OpenStreetMap</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>WDPA Sanctuary</div>
            </div>

            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '16px' }}>↓</div>
            <div style={{ backgroundColor: '#fa2edf', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', display: 'inline-block', fontWeight: 700, marginBottom: '16px' }}>
              PROVIDER ADAPTERS (Normalization & Coordinate Reprojection)
            </div>
            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '16px' }}>↓</div>
            <div style={{ backgroundColor: '#000000', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', display: 'inline-block', fontWeight: 700 }}>
              UNIFIED INTELLIGENCE LAYER (AI Agents & Spatial Graph)
            </div>
          </div>
        </div>
      </section>

      {/* Data Provenance Metadata Table Spec */}
      <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fa2edf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            DATA TRACEABILITY
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', marginTop: '8px' }}>
            Sample Data Provenance Metadata Record
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
            Every MARIS recommendation exposes explicit data provenance metadata so authorized users can inspect supporting evidence.
          </p>
        </div>

        <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#000' }}>ATTRIBUTE</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#000' }}>VALUE</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#000' }}>SPECIFICATION</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fa2edf' }}>Source Provider</td>
                <td style={{ padding: '16px 20px', color: '#000' }}>Copernicus Sentinel-3 / INCOIS</td>
                <td style={{ padding: '16px 20px', color: 'rgba(0,0,0,0.6)' }}>Verified Provider Adapter</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fa2edf' }}>Retrieved Timestamp</td>
                <td style={{ padding: '16px 20px', color: '#000' }}>2026-08-24 11:30:00 UTC</td>
                <td style={{ padding: '16px 20px', color: 'rgba(0,0,0,0.6)' }}>ISO 8601 UTC Record</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fa2edf' }}>Valid Period</td>
                <td style={{ padding: '16px 20px', color: '#000' }}>6 Hours (Expires 17:30 UTC)</td>
                <td style={{ padding: '16px 20px', color: 'rgba(0,0,0,0.6)' }}>Temporal Horizon Window</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fa2edf' }}>Spatial Bounding Box</td>
                <td style={{ padding: '16px 20px', color: '#000' }}>9.15° N – 9.35° N, 79.10° E – 79.30° E</td>
                <td style={{ padding: '16px 20px', color: 'rgba(0,0,0,0.6)' }}>WGS 84 GeoJSON Bounding Box</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fa2edf' }}>Data Quality Score</td>
                <td style={{ padding: '16px 20px', color: '#000' }}>98.2% High Quality (Zero Cloud Occlusion)</td>
                <td style={{ padding: '16px 20px', color: 'rgba(0,0,0,0.6)' }}>Confidence Validation Metric</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '24px', fontSize: '1.05rem', color: '#000000', fontWeight: 600, textAlign: 'center' }}>
          "Every recommendation should be traceable to the data and reasoning that supported it."
        </p>
      </section>

      <CtaSection />
    </div>
  );
};
