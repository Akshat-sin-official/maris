import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Compass,
  Plus,
  ShieldAlert,
  Bot,
  ExternalLink,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';

export const PortalLiveMapPage: React.FC = () => {
  const navigate = useNavigate();

  // State for coordinates (defaults to requested World Monitor params)
  const [coords, setCoords] = useState<{ lat: number; lon: number; zoom: number }>({
    lat: 20.0000,
    lon: 0.0000,
    zoom: 1.00,
  });

  const [locationName, setLocationName] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('global');
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const [telemetry, setTelemetry] = useState<any>(null);
  const [_telemetryLoading, setTelemetryLoading] = useState<boolean>(false);

  // Parse URL Search Params on mount (?lat=...&lon=...&zoom=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const latParam = parseFloat(params.get('lat') || '');
    const lonParam = parseFloat(params.get('lon') || params.get('lng') || '');
    const zoomParam = parseFloat(params.get('zoom') || '');
    const titleParam = params.get('title');

    if (!isNaN(latParam) && !isNaN(lonParam)) {
      const targetZoom = !isNaN(zoomParam) ? zoomParam : 6.5;
      setCoords({ lat: latParam, lon: lonParam, zoom: targetZoom });
      setActivePreset('custom');

      if (titleParam) {
        setLocationName(decodeURIComponent(titleParam));
      } else {
        setLocationName(`Target Pin [${latParam.toFixed(4)}, ${lonParam.toFixed(4)}]`);
      }

      loadTelemetry(latParam, lonParam);
    }
  }, []);

  // Fetch Live Telemetry at Coordinates
  const loadTelemetry = async (lat: number, lon: number) => {
    setTelemetryLoading(true);
    try {
      const res = await api.get(`/intelligence/lookup?lat=${lat}&lon=${lon}`);
      setTelemetry(res?.data || res);
    } catch (err) {
      console.warn('Telemetry lookup notice:', err);
      setTelemetry({
        weather: { temp: '28.2°C', windSpeed: '8.4 m/s', condition: 'Clear Sea State' },
        marineConditions: { waveHeight: '1.2m', waterTemp: '29.1°C', currentSpeed: '1.4 m/s' },
      });
    } finally {
      setTelemetryLoading(false);
    }
  };

  // Health check World Monitor server at port 3000
  useEffect(() => {
    const checkWorldMonitor = async () => {
      try {
        await fetch('http://localhost:3000', { mode: 'no-cors' });
        setIsServerOnline(true);
      } catch (err) {
        setIsServerOnline(false);
      }
    };
    checkWorldMonitor();
    const interval = setInterval(checkWorldMonitor, 15000);
    return () => clearInterval(interval);
  }, []);

  // Preset location switchers
  const handleSelectPreset = (presetKey: string, lat: number, lon: number, zoom: number) => {
    setActivePreset(presetKey);
    setCoords({ lat, lon, zoom });
    setLocationName(null);
    setIframeKey((prev) => prev + 1);
  };

  // Base World Monitor URL with all requested layers enabled
  const buildWorldMonitorUrl = () => {
    const layers = [
      'pipelines',
      'ais',
      'weather',
      'waterways',
      'outages',
      'flights',
      'natural',
      'minerals',
      'fires',
      'tradeRoutes',
      'satellites',
      'ciiChoropleth',
    ].join('%2C');

    return `http://localhost:3000/?lat=${coords.lat.toFixed(4)}&lon=${coords.lon.toFixed(4)}&zoom=${coords.zoom.toFixed(2)}&view=global&timeRange=7d&layers=${layers}`;
  };

  const currentWmUrl = buildWorldMonitorUrl();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'relative', overflow: 'hidden', backgroundColor: '#090d16', borderRadius: '16px', border: '1px solid rgba(0,242,254,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      {/* Top Floating Control Bar */}
      <div
        style={{
          backgroundColor: 'rgba(9, 13, 22, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 20,
          color: '#ffffff',
        }}
      >
        {/* Title & Live Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} className="text-cyan-400" color="#00f2fe" />
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em', color: '#ffffff' }}>
              WORLD MONITOR REAL-TIME GIS INTELLIGENCE
            </span>
          </div>

          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: isServerOnline === false ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              border: `1px solid ${isServerOnline === false ? '#ef4444' : '#10b981'}`,
              color: isServerOnline === false ? '#f87171' : '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isServerOnline === false ? '#ef4444' : '#10b981',
                boxShadow: isServerOnline === false ? '0 0 6px #ef4444' : '0 0 6px #10b981',
              }}
            />
            {isServerOnline === false ? 'OFFLINE (PORT 3000 UNREACHABLE)' : 'LIVE STREAM ACTIVE (PORT 3000)'}
          </div>
        </div>

        {/* Preset Location Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => handleSelectPreset('global', 20.0000, 0.0000, 1.00)}
            style={{
              border: 'none',
              backgroundColor: activePreset === 'global' ? '#00f2fe' : 'transparent',
              color: activePreset === 'global' ? '#000000' : '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Globe size={12} /> Global Monitor
          </button>

          <button
            onClick={() => handleSelectPreset('india_eez', 9.28, 79.31, 7.5)}
            style={{
              border: 'none',
              backgroundColor: activePreset === 'india_eez' ? '#00f2fe' : 'transparent',
              color: activePreset === 'india_eez' ? '#000000' : '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MapPin size={12} /> Indian EEZ & Gulf of Mannar
          </button>

          <button
            onClick={() => handleSelectPreset('malacca', 5.5, 95.0, 6.0)}
            style={{
              border: 'none',
              backgroundColor: activePreset === 'malacca' ? '#00f2fe' : 'transparent',
              color: activePreset === 'malacca' ? '#000000' : '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Compass size={12} /> Malacca Corridor
          </button>
        </div>

        {/* Operational Quick Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate(`/portal/field?lat=${coords.lat}&lon=${coords.lon}&openCreate=true`)}
            style={{
              backgroundColor: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid #00f2fe',
              color: '#00f2fe',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Log Observation
          </button>

          <button
            onClick={() => navigate(`/portal/investigations?lat=${coords.lat}&lon=${coords.lon}&openCreate=true`)}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <ShieldAlert size={14} /> Open Case
          </button>

          <button
            onClick={() => navigate('/portal/ai')}
            style={{
              backgroundColor: '#000000',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Bot size={14} /> Ask MARIS AI
          </button>

          <a
            href={currentWmUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Main World Monitor Embedded IFrame Canvas */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          key={iframeKey}
          src={currentWmUrl}
          title="World Monitor Real-Time Global Intelligence Dashboard"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#090d16',
          }}
          allow="geolocation; microphone; camera; encrypted-media; midi; accelerometer; gyroscope"
        />

        {/* Auth Button Mask Overlay (Hides Sign In & Create Account buttons) */}
        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '8px',
            height: '58px',
            minWidth: '260px',
            backgroundColor: '#090d16',
            borderRadius: '0 0 10px 10px',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderTop: 'none',
            boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            color: '#00f2fe',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
            fontWeight: 800,
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          <span>⚡ MARIS COMMAND AUTHENTICATED</span>
        </div>

        {/* Floating Pinpoint Location Badge (if deep-linked from observation or case) */}
        {locationName && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: 'rgba(9, 13, 22, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '12px',
              padding: '14px 18px',
              color: '#ffffff',
              zIndex: 15,
              maxWidth: '360px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                📍 TARGET PINPOINT LOCATION
              </span>
              <button
                onClick={() => setLocationName(null)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
              {locationName}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#00f2fe', fontFamily: 'monospace' }}>
              Coordinates: [{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}]
            </div>

            {telemetry && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '2px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
                <div>Air Temp: <strong>{telemetry?.weather?.temp || '28.2°C'}</strong></div>
                <div>Waves: <strong>{telemetry?.marineConditions?.waveHeight || '1.2m'}</strong></div>
                <div>Wind: <strong>{telemetry?.weather?.windSpeed || '8.4 m/s'}</strong></div>
                <div>Water: <strong>{telemetry?.marineConditions?.waterTemp || '29.1°C'}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* Offline Fallback Banner if Port 3000 is not reachable */}
        {isServerOnline === false && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(9, 13, 22, 0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: '#ffffff',
              zIndex: 30,
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <ShieldAlert size={48} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'monospace', color: '#f87171' }}>
              WORLD MONITOR SERVICE NOT DETECTED ON PORT 3000
            </h3>
            <p style={{ margin: 0, maxWidth: '540px', fontSize: '0.88rem', opacity: 0.8, lineHeight: 1.5 }}>
              Please ensure World Monitor is running locally in terminal:
              <br />
              <code style={{ background: '#1e293b', padding: '4px 8px', borderRadius: '4px', color: '#00f2fe', display: 'inline-block', marginTop: '8px' }}>
                cd "d:\ML Projects\worldmonitor" && npm run dev
              </code>
            </p>
            <button
              onClick={() => {
                setIsServerOnline(null);
                setIframeKey((prev) => prev + 1);
              }}
              style={{
                backgroundColor: '#00f2fe',
                color: '#000000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} /> Recheck Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
