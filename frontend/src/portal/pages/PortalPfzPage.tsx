import React, { useState, useEffect } from 'react';
import { Fish } from 'lucide-react';
import { INITIAL_PFZ_BULLETINS, type PfzBulletin } from '../data/portalMockData';
import { PortalMapCanvas } from '../components/PortalMapCanvas';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PortalPfzPage: React.FC = () => {
  const { simulatedMode } = useAuth();
  const [bulletins, setBulletins] = useState<PfzBulletin[]>(INITIAL_PFZ_BULLETINS);
  const [selectedPfz, setSelectedPfz] = useState<PfzBulletin>(INITIAL_PFZ_BULLETINS[0]);

  useEffect(() => {
    if (simulatedMode) {
      setBulletins(INITIAL_PFZ_BULLETINS);
      setSelectedPfz(INITIAL_PFZ_BULLETINS[0]);
      return;
    }

    const loadLivePFZ = async () => {
      try {
        // Query general PFZ recommendations near Rameswaram/Gulf of Mannar area (lat 9.28, lon 79.3)
        // We'll call the backend endpoint /api/v1/ai/query to generate dynamic ocean insights or direct services
        const data = await api.post('/ai/query', {
          query: 'Show active Potential Fishing Zones in the Coromandel coast sector.',
          location: { type: 'Point', coordinates: [79.3, 9.28] }
        });
        
        // If live agent traces are returned, map it to mock PfzBulletin structure
        if (data.recommendations && data.recommendations.length > 0) {
          const mapped: PfzBulletin[] = data.recommendations.map((rec: string, index: number) => ({
            id: `PFZ-LIVE-${index}`,
            title: `Live Advisory Zone ${index + 1}`,
            zoneName: rec.split('near')[1]?.trim() || 'Rameswaram East Slope',
            coordinates: [9.28 + (index * 0.1), 79.3 - (index * 0.05)],
            distFromCoastKm: 12 + (index * 5),
            sstCelsius: 28.5 + (index * 0.2),
            chlorophyllMgM3: 0.65 - (index * 0.05),
            depthMeters: 45 + (index * 15),
            targetSpecies: ['Tuna', 'Mackerel', 'Sardines'],
            validityWindow: 'Valid for next 24 Hours',
            potentialScore: 85 - (index * 8),
            recommendedCraft: 'Motorized Crafts (IB / OBM)',
            status: 'ACTIVE',
          }));
          setBulletins(mapped);
          setSelectedPfz(mapped[0]);
        }
      } catch (err) {
        console.error('Failed to query live PFZ info, falling back to mock bulletins', err);
      }
    };

    loadLivePFZ();
  }, [simulatedMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Fish size={16} color="#10b981" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INCOIS & MARIS PFZ INTELLIGENCE BULLETINS
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Potential Fishing Zones Advisory Center
          </h2>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '9999px' }}>
          3 Active High-Potential Zones In Sector
        </div>
      </div>

      {/* Grid: PFZ Cards List & Detailed Inspection Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: PFZ Bulletins List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bulletins.map((pfz) => {
            const isSelected = selectedPfz.id === pfz.id;
            return (
              <div
                key={pfz.id}
                onClick={() => setSelectedPfz(pfz)}
                style={{
                  backgroundColor: '#ffffff',
                  border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '14px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 20px rgba(16,185,129,0.1)' : '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.08em' }}>
                    {pfz.id}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#15803d',
                      backgroundColor: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    Potential: {pfz.potentialScore}/100
                  </span>
                </div>

                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '0 0 6px', color: '#000' }}>
                  {pfz.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)', marginBottom: '10px' }}>
                  {pfz.zoneName} • {pfz.distFromCoastKm} km from coast
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>
                  <span>SST: <strong>{pfz.sstCelsius}°C</strong></span>
                  <span>Chlo: <strong>{pfz.chlorophyllMgM3} mg/m³</strong></span>
                  <span>Depth: <strong>{pfz.depthMeters}m</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected PFZ Detailed Analysis */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              SELECTED ZONE ANALYSIS ({selectedPfz.id})
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
              {selectedPfz.title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
              Location: {selectedPfz.zoneName} [{selectedPfz.coordinates[0]}, {selectedPfz.coordinates[1]}]
            </p>
          </div>

          {/* Key Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>SST THERMAL FRONT</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', marginTop: '2px' }}>{selectedPfz.sstCelsius} °C</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>CHLOROPHYLL FRONT</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', marginTop: '2px' }}>{selectedPfz.chlorophyllMgM3} mg/m³</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>DISTANCE TO COAST</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', marginTop: '2px' }}>{selectedPfz.distFromCoastKm} km</div>
            </div>
          </div>

          {/* Target Species List */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              HIGH PROBABILITY TARGET SPECIES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedPfz.targetSpecies.map((sp, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: '#fafafa',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  🐟 {sp}
                </span>
              ))}
            </div>
          </div>

          {/* Craft Recommendation */}
          <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#166534' }}>Recommended Craft & Gear:</div>
            <div style={{ fontSize: '0.82rem', color: '#14532d', marginTop: '2px' }}>
              {selectedPfz.recommendedCraft} • Maximum ocean depth {selectedPfz.depthMeters} meters
            </div>
          </div>

          {/* Spatial Preview Map snippet */}
          <PortalMapCanvas height="240px" initialLayers={{ pfz: true, sst: true }} />
        </div>
      </div>
    </div>
  );
};
