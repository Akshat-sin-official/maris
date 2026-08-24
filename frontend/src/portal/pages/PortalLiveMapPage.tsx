import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  AlertTriangle,
  Compass,
  Bot,
  Info,
  Fish,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { socketService } from '../services/socket';

interface MapLayersState {
  incidents: boolean;
  observations: boolean;
  pfz: boolean;
  geofences: boolean;
  alerts: boolean;
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

export const PortalLiveMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { simulatedMode } = useAuth();
  
  // Ref to hold the MapLibre map instance
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Markers arrays to clear on redraw
  const incidentMarkersRef = useRef<maplibregl.Marker[]>([]);
  const observationMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Layer switches
  const [layers, setLayers] = useState<MapLayersState>({
    incidents: true,
    observations: true,
    pfz: true,
    geofences: true,
    alerts: true,
  });

  // Layer loading/error states
  const [loadingStates, setLoadingStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({
    incidents: 'idle',
    observations: 'idle',
    pfz: 'idle',
    geofences: 'idle',
    alerts: 'idle',
    lookup: 'idle',
  });

  // Location Inspector Sidebar
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [locationIntelligence, setLocationIntelligence] = useState<any>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Standard safe default Indian Coastal View (Gulf of Mannar area)
    const defaultCenter: [number, number] = [79.3, 9.28]; 

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_DARK_STYLE,
      center: defaultCenter,
      zoom: 9,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    // Click handler for location inspector
    map.on('click', (e: maplibregl.MapMouseEvent) => {
      const { lat, lng } = e.lngLat;
      handleMapClick(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch metrics & draw markers based on simulatedMode or active layers
  useEffect(() => {
    if (!mapRef.current) return;

    drawIncidents();
    drawObservations();
    drawGeometries();
  }, [simulatedMode, layers.incidents, layers.observations, layers.pfz, layers.geofences, layers.alerts]);

  // Hook up Real-time Socket Updates
  useEffect(() => {
    const token = localStorage.getItem('maris_jwt_token') || 'test-mock-token';
    socketService.connect(token, (eventName, data) => {
      console.log('⚡ Map received realtime event:', eventName, data);
      
      // Flash a brief toast or notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        background: #090d16;
        border: 1px solid #00f2fe;
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 0 15px rgba(0,242,254,0.25);
        font-size: 0.82rem;
        z-index: 99999;
        transition: all 0.3s ease;
      `;
      notification.innerText = `Realtime Event: ${eventName.replace('_', ' ').toUpperCase()}`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);

      // Trigger redraws depending on event
      if (eventName === 'new_incident' || eventName === 'incident_synced') {
        drawIncidents();
      } else if (eventName === 'observation_received') {
        drawObservations();
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Map click handler (debounced implicitly, triggers backend Lookup API)
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedCoords([lng, lat]);
    setInspectorOpen(true);
    setLoadingStates(prev => ({ ...prev, lookup: 'loading' }));

    try {
      const data = await api.get(`/intelligence/lookup?lat=${lat}&lng=${lng}`);
      setLocationIntelligence(data);
      setLoadingStates(prev => ({ ...prev, lookup: 'success' }));

      // Render geofence boundaries on map if returned
      if (data.geofences && data.geofences.length > 0 && mapRef.current) {
        const map = mapRef.current;
        // Clean old geofence layer if it exists
        if (map.getLayer('selected-geofence')) map.removeLayer('selected-geofence');
        if (map.getSource('selected-geofence-src')) map.removeSource('selected-geofence-src');

        const firstFence = data.geofences[0];
        if (firstFence.polygon) {
          map.addSource('selected-geofence-src', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: firstFence.polygon,
            },
          });
          map.addLayer({
            id: 'selected-geofence',
            type: 'fill',
            source: 'selected-geofence-src',
            layout: {},
            paint: {
              'fill-color': '#ff0055',
              'fill-opacity': 0.15,
              'fill-outline-color': '#ff0055',
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed coordinates lookup', err);
      setLoadingStates(prev => ({ ...prev, lookup: 'error' }));
      setLocationIntelligence(null);
    }
  };

  // Draw Incident point markers
  const drawIncidents = async () => {
    // Clear old markers
    incidentMarkersRef.current.forEach(m => m.remove());
    incidentMarkersRef.current = [];

    if (!layers.incidents || !mapRef.current) return;
    setLoadingStates(prev => ({ ...prev, incidents: 'loading' }));

    try {
      let list: any[] = [];
      if (simulatedMode) {
        // Fallback simulated points in Palk Bay / Mannar
        list = [
          { id: '1', title: 'Suspicious Vessel', priority: 'CRITICAL', coordinates: [79.22, 9.15] },
          { id: '2', title: 'Coral Reef Geofence Breach', priority: 'HIGH', coordinates: [79.4, 9.35] },
        ];
      } else {
        const res = await api.get('/incidents');
        const dataList = Array.isArray(res) ? res : res.data || [];
        list = dataList.map((inc: any) => ({
          id: inc.id || inc._id,
          title: inc.title,
          priority: inc.priority,
          coordinates: inc.location?.coordinates || [79.3, 9.28],
        }));
      }

      list.forEach((inc) => {
        const el = document.createElement('div');
        const color = inc.priority === 'CRITICAL' ? '#ff0055' : inc.priority === 'HIGH' ? '#ff9900' : '#00f2fe';
        el.style.cssText = `
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #fff;
          box-shadow: 0 0 10px ${color};
          cursor: pointer;
        `;

        const marker = new maplibregl.Marker(el)
          .setLngLat(inc.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(`
            <div style="color: #000; font-family: monospace; font-size: 0.8rem; padding: 4px;">
              <strong>INCIDENT:</strong> ${inc.title}<br/>
              <strong>Priority:</strong> ${inc.priority}<br/>
              <button onclick="window.location.hash='#/portal/investigations'" style="margin-top: 6px; padding: 2px 6px; font-size: 0.72rem; cursor: pointer;">View Investigation</button>
            </div>
          `))
          .addTo(mapRef.current!);
        
        incidentMarkersRef.current.push(marker);
      });
      setLoadingStates(prev => ({ ...prev, incidents: 'success' }));
    } catch (err) {
      setLoadingStates(prev => ({ ...prev, incidents: 'error' }));
    }
  };

  // Draw Field Observation point markers
  const drawObservations = async () => {
    observationMarkersRef.current.forEach(m => m.remove());
    observationMarkersRef.current = [];

    if (!layers.observations || !mapRef.current) return;
    setLoadingStates(prev => ({ ...prev, observations: 'loading' }));

    try {
      let list: any[] = [];
      if (simulatedMode) {
        list = [
          { id: 'obs-1', title: 'Oil sheen report', category: 'POLLUTION', coordinates: [79.12, 9.1] },
        ];
      } else {
        const res = await api.get('/observations');
        const dataList = Array.isArray(res) ? res : res.data || [];
        list = dataList.map((obs: any) => ({
          id: obs.id || obs._id,
          title: obs.description?.split('\n')[0] || 'Observation',
          category: obs.incidentType,
          coordinates: obs.location?.coordinates || [79.25, 9.18],
        }));
      }

      list.forEach((obs) => {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 12px;
          height: 12px;
          transform: rotate(45deg);
          background: #10b981;
          border: 1px solid #fff;
          cursor: pointer;
        `;

        const marker = new maplibregl.Marker(el)
          .setLngLat(obs.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(`
            <div style="color: #000; font-family: monospace; font-size: 0.8rem; padding: 4px;">
              <strong>OBSERVATION:</strong> ${obs.title}<br/>
              <strong>Category:</strong> ${obs.category}<br/>
              <button onclick="window.location.hash='#/portal/field'" style="margin-top: 6px; padding: 2px 6px; font-size: 0.72rem; cursor: pointer;">View Sighting</button>
            </div>
          `))
          .addTo(mapRef.current!);
        
        observationMarkersRef.current.push(marker);
      });
      setLoadingStates(prev => ({ ...prev, observations: 'success' }));
    } catch (err) {
      setLoadingStates(prev => ({ ...prev, observations: 'error' }));
    }
  };

  // Draw layers geometry maps (PFZ, Geofences, Alerts)
  const drawGeometries = () => {
    // Optional vector layers mapping can be implemented here directly in WebGL
  };

  // Near Me trigger
  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [longitude, latitude], zoom: 11 });
            handleMapClick(latitude, longitude);
          }
        },
        (err) => console.warn('Geolocation access denied', err)
      );
    }
  };

  // Ask MARIS redirection
  const handleAskMaris = () => {
    if (!selectedCoords) return;
    const [lng, lat] = selectedCoords;
    // Store coordinates in local state / navigation context
    navigate('/portal/ai', {
      state: {
        prefill: `Perform full marine safety audit near coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]. Is it safe for small craft operations tomorrow morning?`,
      },
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', height: 'calc(100vh - 120px)', position: 'relative', overflow: 'hidden', fontFamily: 'monospace' }}>
      
      {/* GIS Canvas Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#090d16' }} />

      {/* FLOATING LEFT PANEL: LAYERS & CONTROLS */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '280px',
        backgroundColor: 'rgba(9, 13, 22, 0.95)',
        border: '1px solid rgba(0, 242, 254, 0.15)',
        borderRadius: '12px',
        padding: '16px',
        color: '#fff',
        zIndex: 10,
        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          <Layers size={18} className="text-cyan-400" />
          <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>MAP LAYER MANAGER</span>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(layers).map((key) => {
            const layerKey = key as keyof MapLayersState;
            return (
              <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={layers[layerKey]}
                    onChange={() => setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))}
                    style={{ accentColor: '#00f2fe' }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                </div>
                <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>
                  {loadingStates[key] === 'loading' ? 'Loading...' : 'Active'}
                </span>
              </label>
            );
          })}
        </div>

        {/* Collapsible Legend */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, display: 'block', marginBottom: '8px' }}>LEGEND</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.72rem' }}>
            {layers.incidents && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff0055' }} />
                <span>Critical Incidents</span>
              </div>
            )}
            {layers.observations && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', backgroundColor: '#10b981' }} />
                <span>Field Sighting</span>
              </div>
            )}
            {layers.geofences && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '8px', border: '1px dashed #ff0055', background: 'rgba(255,0,85,0.08)' }} />
                <span>Geofenced Boundary</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleNearMe}
          style={{
            width: '100%',
            backgroundColor: '#00f2fe',
            color: '#000',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Compass size={14} /> NEAR ME
        </button>
      </div>

      {/* FLOATING RIGHT INSPECTOR SIDEBAR */}
      {inspectorOpen && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          bottom: '20px',
          width: '380px',
          backgroundColor: 'rgba(9, 13, 22, 0.95)',
          border: '1px solid rgba(0, 242, 254, 0.15)',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          zIndex: 10,
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em', color: '#00f2fe' }}>LOCATION INSPECTOR</span>
            <button onClick={() => setInspectorOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>×</button>
          </div>

          {selectedCoords && (
            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ opacity: 0.5 }}>COORDINATES</span>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: '2px' }}>
                  LAT: {selectedCoords[1].toFixed(5)} • LNG: {selectedCoords[0].toFixed(5)}
                </div>
              </div>

              {loadingStates.lookup === 'loading' ? (
                <div style={{ opacity: 0.6 }}>Loading Marine Intelligence...</div>
              ) : locationIntelligence ? (
                <>
                  {/* Marine Conditions */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#00f2fe' }}>
                      <Activity size={14} />
                      <span style={{ fontWeight: 700 }}>MARINE CONDITIONS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.9 }}>
                      <div>SST / Water Temp: {locationIntelligence.marineConditions?.waterTemp !== null ? `${locationIntelligence.marineConditions.waterTemp} °C` : 'Not available'}</div>
                      <div>Wave Height: {locationIntelligence.marineConditions?.waveHeight !== null ? `${locationIntelligence.marineConditions.waveHeight} m` : 'Not available'}</div>
                      <div>Wave Period: {locationIntelligence.marineConditions?.wavePeriod !== null ? `${locationIntelligence.marineConditions.wavePeriod} s` : 'Not available'}</div>
                      <div>Current Speed: {locationIntelligence.marineConditions?.currentSpeed !== null ? `${locationIntelligence.marineIntelligence?.marineConditions?.currentSpeed ?? locationIntelligence.marineConditions.currentSpeed} m/s` : 'Not available'}</div>
                      <div>Source: {locationIntelligence.marineConditions?.source || 'Not available'}</div>
                    </div>
                  </div>

                  {/* Active Alerts */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#ff0055' }}>
                      <AlertTriangle size={14} />
                      <span style={{ fontWeight: 700 }}>ACTIVE HAZARD ALERTS</span>
                    </div>
                    {locationIntelligence.alerts?.length > 0 ? (
                      locationIntelligence.alerts.map((alt: any, idx: number) => (
                        <div key={idx} style={{ background: 'rgba(255,0,85,0.05)', border: '1px solid rgba(255,0,85,0.15)', borderRadius: '6px', padding: '10px', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 700 }}>{alt.type} • {alt.severity}</div>
                          <div style={{ opacity: 0.8, marginTop: '4px' }}>{alt.description}</div>
                          <div style={{ opacity: 0.5, fontSize: '0.68rem', marginTop: '6px' }}>Source: {alt.source}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ opacity: 0.6 }}>No active alerts in this grid area.</div>
                    )}
                  </div>

                  {/* Geofences */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#ff9900' }}>
                      <Info size={14} />
                      <span style={{ fontWeight: 700 }}>RESTRICTED BOUNDARIES</span>
                    </div>
                    {locationIntelligence.geofences?.length > 0 ? (
                      locationIntelligence.geofences.map((fence: any, idx: number) => (
                        <div key={idx} style={{ background: 'rgba(255,153,0,0.05)', border: '1px solid rgba(255,153,0,0.15)', borderRadius: '6px', padding: '10px', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 700 }}>{fence.name}</div>
                          <div style={{ opacity: 0.5, fontSize: '0.68rem', marginTop: '6px' }}>Boundary Source: {fence.source}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ opacity: 0.6 }}>No boundary restrictions overlapping this point.</div>
                    )}
                  </div>

                  {/* PFZ bulletins */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#10b981' }}>
                      <Fish size={14} />
                      <span style={{ fontWeight: 700 }}>PFZ INTEL ADVISORIES</span>
                    </div>
                    {locationIntelligence.pfz?.length > 0 ? (
                      locationIntelligence.pfz.map((pfz: any, idx: number) => (
                        <div key={idx} style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '6px', padding: '10px', marginBottom: '8px' }}>
                          <div>Chlorophyll Density: {pfz.chlorophyll ? `${pfz.chlorophyll} mg/m³` : 'Not available'}</div>
                          <div>SST Gradient Proxy: {pfz.sstGradient ? `${pfz.sstGradient} °C` : 'Not available'}</div>
                          <div>Analytical Confidence: {pfz.confidence ? `${(pfz.confidence * 100).toFixed(0)}%` : 'Not available'}</div>
                          <div style={{ opacity: 0.5, fontSize: '0.68rem', marginTop: '6px' }}>Source: {pfz.source}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ opacity: 0.6 }}>No potential fishing zone indices detected.</div>
                    )}
                  </div>

                  {/* Ask MARIS Trigger */}
                  <button
                    onClick={handleAskMaris}
                    style={{
                      width: '100%',
                      backgroundColor: '#000',
                      color: '#00f2fe',
                      border: '1px solid #00f2fe',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '10px',
                      boxShadow: '0 0 10px rgba(0,242,254,0.1)',
                    }}
                  >
                    <Bot size={14} /> ASK MARIS ABOUT THIS GRID
                  </button>
                </>
              ) : (
                <div style={{ opacity: 0.6 }}>Intelligence lookup unavailable.</div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
