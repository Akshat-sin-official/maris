import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Radio, ZoomIn, ZoomOut } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MapLayerState {
  liveLocations: boolean;
  incidents: boolean;
  observations: boolean;
  pfz: boolean;
  geofence: boolean;
}

interface PortalMapCanvasProps {
  height?: string;
  initialLayers?: Partial<MapLayerState>;
  onSelectFeature?: (feature: any) => void;
}

const CARTO_DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark-tiles': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const PortalMapCanvas: React.FC<PortalMapCanvasProps> = ({
  height = '480px',
  initialLayers,
  onSelectFeature,
}) => {
  const { simulatedMode } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [layers, setLayers] = useState<MapLayerState>({
    liveLocations: true,
    incidents: true,
    observations: true,
    pfz: true,
    geofence: true,
    ...initialLayers,
  });

  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_DARK_STYLE,
      center: [79.31, 9.28], // Gulf of Mannar & Palk Bay Sector
      zoom: 9,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch data & draw dynamic MapLibre Markers
  const drawMapFeatures = async () => {
    if (!mapRef.current) return;
    setLoading(true);

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    try {
      const [locRes, incRes, obsRes] = await Promise.allSettled([
        layers.liveLocations ? api.get('/intelligence/live-locations') : Promise.resolve(null),
        layers.incidents ? api.get('/incidents') : Promise.resolve(null),
        layers.observations ? api.get('/observations') : Promise.resolve(null),
      ]);

      // 1. Live Telemetry Beacons (Red Pulsing Vessel Markers)
      if (locRes.status === 'fulfilled' && locRes.value?.locations) {
        const locations = Array.isArray(locRes.value.locations) ? locRes.value.locations : [];
        locations.forEach((loc: any) => {
          const el = document.createElement('div');
          el.className = 'live-beacon-marker';
          el.style.cssText = `
            width: 18px;
            height: 18px;
            background-color: #ef4444;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px #ef4444;
            cursor: pointer;
          `;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([loc.longitude || 79.31, loc.latitude || 9.28])
            .addTo(mapRef.current!);

          el.addEventListener('click', () => {
            setActiveFeature({ type: 'LIVE_BEACON', data: loc });
            if (onSelectFeature) onSelectFeature(loc);
          });

          markersRef.current.push(marker);
        });
      }

      // 2. Incident Markers (Yellow / Orange Markers)
      if (incRes.status === 'fulfilled' && incRes.value) {
        const rawInc = incRes.value.data?.incidents || incRes.value.data || incRes.value;
        const incidents = Array.isArray(rawInc) ? rawInc : [];
        incidents.forEach((inc: any) => {
          const coords: [number, number] = inc.location?.coordinates
            ? [inc.location.coordinates[0], inc.location.coordinates[1]]
            : [inc.coordinates?.[1] || 79.35, inc.coordinates?.[0] || 9.32];

          const el = document.createElement('div');
          el.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #f59e0b;
            border: 2px solid #ffffff;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `;
          el.innerText = '!';

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(mapRef.current!);

          el.addEventListener('click', () => {
            setActiveFeature({ type: 'INCIDENT', data: inc });
            if (onSelectFeature) onSelectFeature(inc);
          });

          markersRef.current.push(marker);
        });
      }

      // 3. Field Observation Markers (Green Circle Markers)
      if (obsRes.status === 'fulfilled' && obsRes.value) {
        const rawObs = obsRes.value.data?.observations || obsRes.value.data || obsRes.value;
        const obsList = Array.isArray(rawObs) ? rawObs : [];
        obsList.forEach((obs: any) => {
          const coords: [number, number] = obs.coordinates
            ? [obs.coordinates[1] || obs.coordinates[0], obs.coordinates[0] || obs.coordinates[1]]
            : [79.22, 9.21];

          const el = document.createElement('div');
          el.style.cssText = `
            width: 16px;
            height: 16px;
            background-color: #10b981;
            border: 2px solid #ffffff;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 6px #10b981;
          `;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(mapRef.current!);

          el.addEventListener('click', () => {
            setActiveFeature({ type: 'OBSERVATION', data: obs });
            if (onSelectFeature) onSelectFeature(obs);
          });

          markersRef.current.push(marker);
        });
      }
    } catch (err) {
      console.warn('Map Canvas render notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    drawMapFeatures();

    const handleModeChange = () => {
      drawMapFeatures();
    };

    window.addEventListener('maris:simulated_mode_changed', handleModeChange);
    const interval = setInterval(drawMapFeatures, 25000);

    return () => {
      window.removeEventListener('maris:simulated_mode_changed', handleModeChange);
      clearInterval(interval);
    };
  }, [simulatedMode, layers.liveLocations, layers.incidents, layers.observations]);

  const toggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Real MapLibre Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Layer Selector Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLayerMenuOpen(!layerMenuOpen)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Layers size={14} />
            <span>GIS Layers</span>
            {loading && <Radio size={12} className="animate-spin text-emerald-400" />}
          </button>

          {layerMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '210px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                padding: '10px',
                zIndex: 20,
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                MAP CONTROLS
              </div>
              {[
                { key: 'liveLocations', label: '🔴 Live AIS Beacons' },
                { key: 'incidents', label: '⚠️ Incident Markers' },
                { key: 'observations', label: '🟢 Field Observations' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 2px',
                    fontSize: '0.76rem',
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
      </div>

      {/* Map Legend Overlay Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.15)',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '0.7rem',
          color: '#ffffff',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span>AIS Vessel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }} />
          <span>Incident</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span>Observation</span>
        </div>
      </div>

      {/* Active Feature Detail Popup */}
      {activeFeature && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '280px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            padding: '14px',
            zIndex: 30,
            color: '#0f172a',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: activeFeature.type === 'LIVE_BEACON' ? '#fee2e2' : '#fef3c7',
                color: activeFeature.type === 'LIVE_BEACON' ? '#dc2626' : '#d97706',
              }}
            >
              {activeFeature.type}
            </span>
            <button
              onClick={() => setActiveFeature(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}
            >
              ×
            </button>
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 600 }}>
            {activeFeature.data.title || activeFeature.data.locality || 'Map Highlight'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
            {activeFeature.data.description || activeFeature.data.notes || `Location: ${activeFeature.data.locality || 'Gulf of Mannar'}`}
          </p>
        </div>
      )}
    </div>
  );
};
