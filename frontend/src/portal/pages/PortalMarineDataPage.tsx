import React, { useState } from 'react';
import { Activity, CloudRain, Wind, Thermometer } from 'lucide-react';
import { PROVIDER_HEALTH_LIST } from '../data/portalMockData';

export const PortalMarineDataPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'OCEAN' | 'WEATHER' | 'SATELLITE'>('ALL');

  const oceanVariables = [
    {
      name: 'Sea Surface Temperature (SST)',
      currentVal: '27.8 °C',
      anomaly: '+0.4 °C above 10yr mean',
      provider: 'Copernicus CMEMS Sentinel-3 SLSTR',
      resolution: '1 km spatial grid',
      status: 'UPDATED',
      lastPass: '14 mins ago',
      icon: Thermometer,
    },
    {
      name: 'Chlorophyll-a Concentration',
      currentVal: '2.14 mg/m³',
      anomaly: 'Strong thermal front gradient',
      provider: 'Sentinel-3 OLCI Ocean Colour',
      resolution: '300m spatial grid',
      status: 'UPDATED',
      lastPass: '28 mins ago',
      icon: Activity,
    },
    {
      name: 'Significant Wave Height (Hs)',
      currentVal: '3.8 meters',
      anomaly: 'High Swell Warning (Swell T = 14s)',
      provider: 'INCOIS Wave Swell Surge Model',
      resolution: 'Coastal 0.05° Grid',
      status: 'CRITICAL',
      lastPass: '5 mins ago',
      icon: Wind,
    },
    {
      name: 'Surface Wind Velocity',
      currentVal: '24 knots (SW)',
      anomaly: 'Gusts up to 32 knots in squall',
      provider: 'IMD Coastal Scatterometer Radar',
      resolution: 'Real-time 10m Vector',
      status: 'UPDATED',
      lastPass: '12 mins ago',
      icon: CloudRain,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '0 0 6px' }}>
            Marine Intelligence & Data Explorer
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
            Normalized multi-provider oceanography, weather feeds, and satellite pass metadata
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveCategory('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeCategory === 'ALL' ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: activeCategory === 'ALL' ? '#000' : '#fff',
              color: activeCategory === 'ALL' ? '#fff' : '#000',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All Datasets
          </button>
          <button
            onClick={() => setActiveCategory('OCEAN')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeCategory === 'OCEAN' ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: activeCategory === 'OCEAN' ? '#000' : '#fff',
              color: activeCategory === 'OCEAN' ? '#fff' : '#000',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ocean Variables
          </button>
          <button
            onClick={() => setActiveCategory('WEATHER')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeCategory === 'WEATHER' ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: activeCategory === 'WEATHER' ? '#000' : '#fff',
              color: activeCategory === 'WEATHER' ? '#fff' : '#000',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Weather & Wind
          </button>
        </div>
      </div>

      {/* Ocean Variables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {oceanVariables.map((v, idx) => {
          const Icon = v.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color="#000" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
                      {v.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)' }}>{v.lastPass}</span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: '0 0 4px' }}>{v.name}</h3>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: v.status === 'CRITICAL' ? '#dc2626' : '#000000' }}>
                  {v.currentVal}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)', marginTop: '4px' }}>{v.anomaly}</div>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>
                <div><strong>Source:</strong> {v.provider}</div>
                <div><strong>Grid Resolution:</strong> {v.resolution}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Normalized Data Provider Health Matrix */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: '0 0 16px' }}>
          Data Provider Adapter Health Matrix
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PROVIDER_HEALTH_LIST.map((prov, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.06)',
                backgroundColor: '#fafafa',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: prov.status === 'OPERATIONAL' ? '#22c55e' : '#f59e0b',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000' }}>{prov.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>{prov.coverage}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem', color: 'rgba(0,0,0,0.6)' }}>
                <div>Latency: <strong style={{ color: '#000' }}>{prov.latencyMs} ms</strong></div>
                <div>Last Stream: <strong style={{ color: '#000' }}>{prov.lastSync}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
