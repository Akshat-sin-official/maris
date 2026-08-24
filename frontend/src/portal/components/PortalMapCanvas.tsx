import React, { useState } from 'react';
import { Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { INITIAL_ALERTS, INITIAL_PFZ_BULLETINS, INITIAL_FIELD_OBSERVATIONS } from '../data/portalMockData';

interface MapLayerState {
  sst: boolean;
  chlorophyll: boolean;
  waves: boolean;
  pfz: boolean;
  alerts: boolean;
  fieldObs: boolean;
  geofence: boolean;
}

interface PortalMapCanvasProps {
  height?: string;
  initialLayers?: Partial<MapLayerState>;
  onSelectFeature?: (feature: any) => void;
}

export const PortalMapCanvas: React.FC<PortalMapCanvasProps> = ({
  height = '580px',
  initialLayers,
  onSelectFeature,
}) => {
  const [layers, setLayers] = useState<MapLayerState>({
    sst: true,
    chlorophyll: false,
    waves: true,
    pfz: true,
    alerts: true,
    fieldObs: true,
    geofence: true,
    ...initialLayers,
  });

  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const toggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        backgroundColor: '#e6f0fa',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* SVG Canvas Map Surface simulating High-Res Ocean Hydrographic Chart */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease',
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 1000 600"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            {/* SST Heatmap Gradient */}
            <linearGradient id="sstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="50%" stopColor="rgba(234, 179, 8, 0.3)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.35)" />
            </linearGradient>

            {/* Chlorophyll Gradient */}
            <linearGradient id="chloGradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.05)" />
              <stop offset="70%" stopColor="rgba(34, 197, 94, 0.35)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.5)" />
            </linearGradient>

            {/* Wave Grid Pattern */}
            <pattern id="wavePattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 20 Q 10 10, 20 20 T 40 20" fill="none" stroke="rgba(2, 132, 199, 0.2)" strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* Ocean Base Background */}
          <rect width="1000" height="600" fill="#e0f2fe" />

          {/* Graticule Grid Lines */}
          <g stroke="rgba(0, 50, 100, 0.08)" strokeWidth="1" strokeDasharray="4 4">
            <line x1="200" y1="0" x2="200" y2="600" />
            <line x1="400" y1="0" x2="400" y2="600" />
            <line x1="600" y1="0" x2="600" y2="600" />
            <line x1="800" y1="0" x2="800" y2="600" />
            <line x1="0" y1="150" x2="1000" y2="150" />
            <line x1="0" y1="300" x2="1000" y2="300" />
            <line x1="0" y1="450" x2="1000" y2="450" />
          </g>

          {/* Bathymetry Contours */}
          <path d="M 120,0 C 180,180 220,320 280,600" fill="none" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="2" />
          <path d="M 180,0 C 260,200 320,380 380,600" fill="none" stroke="rgba(14, 165, 233, 0.4)" strokeWidth="1.5" />
          <text x="290" y="580" fill="rgba(14, 165, 233, 0.6)" fontSize="10" fontFamily="monospace">200m Depth</text>

          {/* Land Mass Vectors (Southern India Coastline & Sri Lanka Representation) */}
          <path
            d="M 0,0 L 250,0 C 230,120 210,220 180,280 C 160,320 120,400 80,450 C 40,500 0,550 0,600 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* Sri Lanka Coastline Vector */}
          <path
            d="M 480,260 C 560,260 620,340 600,440 C 580,500 500,520 440,460 C 400,420 420,320 480,260 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* Geographic Labels */}
          <text x="70" y="160" fill="rgba(0,0,0,0.5)" fontSize="14" fontWeight="600" fontFamily="var(--font-body)">Tamil Nadu Coast</text>
          <text x="500" y="380" fill="rgba(0,0,0,0.5)" fontSize="13" fontWeight="600" fontFamily="var(--font-body)">Sri Lanka</text>
          <text x="320" y="180" fill="rgba(2, 132, 199, 0.7)" fontSize="15" fontWeight="600" fontFamily="var(--font-body)" letterSpacing="0.05em">PALK BAY</text>
          <text x="310" y="420" fill="rgba(2, 132, 199, 0.7)" fontSize="16" fontWeight="600" fontFamily="var(--font-body)" letterSpacing="0.08em">GULF OF MANNAR</text>

          {/* LAYER 1: SST Heatmap Overlay */}
          {layers.sst && (
            <path
              d="M 200,80 C 350,120 450,220 380,380 C 300,500 200,450 180,280 Z"
              fill="url(#sstGradient)"
            />
          )}

          {/* LAYER 2: Chlorophyll Front Overlay */}
          {layers.chlorophyll && (
            <path
              d="M 320,100 C 420,140 460,250 400,320 C 340,400 280,300 320,100 Z"
              fill="url(#chloGradient)"
            />
          )}

          {/* LAYER 3: Wave Pattern Overlay */}
          {layers.waves && <rect x="200" y="0" width="800" height="600" fill="url(#wavePattern)" opacity="0.6" />}

          {/* LAYER 4: Geofence Marine Protected Area (MPA) */}
          {layers.geofence && (
            <g>
              <polygon
                points="280,320 380,310 420,390 310,410"
                fill="rgba(239, 68, 68, 0.12)"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text x="300" y="360" fill="#dc2626" fontSize="11" fontWeight="600" fontFamily="var(--font-body)">
                Biosphere Sanctuary Zone
              </text>
            </g>
          )}

          {/* LAYER 5: PFZ advisories markers */}
          {layers.pfz &&
            INITIAL_PFZ_BULLETINS.map((pfz) => {
              const cx = 350 + (pfz.coordinates[1] - 78.5) * 120;
              const cy = 400 - (pfz.coordinates[0] - 8.5) * 110;
              return (
                <g
                  key={pfz.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setActiveFeature({ type: 'PFZ', data: pfz });
                    if (onSelectFeature) onSelectFeature(pfz);
                  }}
                >
                  <circle cx={cx} cy={cy} r="22" fill="rgba(16, 185, 129, 0.2)" />
                  <circle cx={cx} cy={cy} r="14" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                  <text x={cx - 5} y={cy + 4} fill="#ffffff" fontSize="11" fontWeight="bold">PFZ</text>
                </g>
              );
            })}

          {/* LAYER 6: Active Alerts markers */}
          {layers.alerts &&
            INITIAL_ALERTS.map((alt) => {
              const cx = 330 + (alt.coordinates[1] - 78.5) * 110;
              const cy = 380 - (alt.coordinates[0] - 8.5) * 105;
              const color = alt.severity === 'CRITICAL' ? '#ef4444' : alt.severity === 'HIGH' ? '#f59e0b' : '#3b82f6';
              return (
                <g
                  key={alt.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setActiveFeature({ type: 'ALERT', data: alt });
                    if (onSelectFeature) onSelectFeature(alt);
                  }}
                >
                  <circle cx={cx} cy={cy} r="24" fill={color} opacity="0.25">
                    <animate attributeName="r" values="16;28;16" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r="12" fill={color} stroke="#ffffff" strokeWidth="2" />
                  <text x={cx - 3} y={cy + 4} fill="#ffffff" fontSize="10" fontWeight="bold">!</text>
                </g>
              );
            })}

          {/* LAYER 7: Field Observations markers */}
          {layers.fieldObs &&
            INITIAL_FIELD_OBSERVATIONS.map((obs) => {
              const cx = 290 + (obs.coordinates[1] - 78.5) * 105;
              const cy = 350 - (obs.coordinates[0] - 8.5) * 98;
              return (
                <g
                  key={obs.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setActiveFeature({ type: 'OBSERVATION', data: obs });
                    if (onSelectFeature) onSelectFeature(obs);
                  }}
                >
                  <rect x={cx - 10} y={cy - 10} width="20" height="20" rx="4" fill="#000000" stroke="#ffffff" strokeWidth="2" />
                  <text x={cx - 4} y={cy + 4} fill="#ffffff" fontSize="10" fontWeight="bold">O</text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Map Control Toolbar Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10,
        }}
      >
        {/* Layer Selector Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLayerMenuOpen(!layerMenuOpen)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.12)',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <Layers size={16} />
            <span>Map Layers</span>
          </button>

          {layerMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '220px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                padding: '12px',
                zIndex: 20,
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', marginBottom: '8px' }}>
                TOGGLE VECTOR & RASTER LAYERS
              </div>
              {[
                { key: 'sst', label: 'SST Thermal Heatmap' },
                { key: 'chlorophyll', label: 'Chlorophyll-a Concentration' },
                { key: 'waves', label: 'Wave Swell Grid' },
                { key: 'pfz', label: 'PFZ Advisory Zones' },
                { key: 'alerts', label: 'Hazard & Cyclone Alerts' },
                { key: 'fieldObs', label: 'Field Observations' },
                { key: 'geofence', label: 'Protected Sanctuary Bounds' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 4px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={layers[key as keyof MapLayerState]}
                    onChange={() => toggleLayer(key as keyof MapLayerState)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Zoom In & Out */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#ffffff', overflow: 'hidden' }}>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
            style={{ padding: '8px 12px', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 15, 80))}
            style={{ padding: '8px 12px', border: 'none', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <ZoomOut size={16} />
          </button>
        </div>
      </div>

      {/* Map Legend Overlay Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-body)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span>PFZ Zone</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span>Hazard Alert</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#000000', display: 'inline-block' }} />
          <span>Field Observation</span>
        </div>
      </div>

      {/* Selected Feature Popup Side Panel / Modal */}
      {activeFeature && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '320px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            padding: '16px',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: activeFeature.type === 'ALERT' ? '#fee2e2' : '#dcfce7',
                color: activeFeature.type === 'ALERT' ? '#dc2626' : '#15803d',
              }}
            >
              {activeFeature.type}
            </span>
            <button
              onClick={() => setActiveFeature(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(0,0,0,0.4)' }}
            >
              ×
            </button>
          </div>

          <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontFamily: 'var(--font-heading)' }}>
            {activeFeature.data.title || activeFeature.data.zoneName}
          </h4>

          <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'rgba(0,0,0,0.65)', lineHeight: 1.4 }}>
            {activeFeature.data.description || activeFeature.data.notes || `SST: ${activeFeature.data.sstCelsius}°C | Potential Score: ${activeFeature.data.potentialScore}/100`}
          </p>

          <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)' }}>
            Coordinates: [{activeFeature.data.coordinates[0]}, {activeFeature.data.coordinates[1]}]
          </div>
        </div>
      )}
    </div>
  );
};
