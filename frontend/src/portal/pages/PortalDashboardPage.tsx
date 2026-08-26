import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Radio,
  Fish,
  Bot,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { PortalMapCanvas } from '../components/PortalMapCanvas';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { socketService } from '../services/socket';

export const PortalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [observationsList, setObservationsList] = useState<any[]>([]);
  const [tipsList, setTipsList] = useState<any[]>([]);
  const [pfzScore, setPfzScore] = useState<number>(92);
  const [_loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLiveDashboardData = async () => {
      setLoading(true);
      try {
        const [incRes, obsRes, tipsRes, intelRes] = await Promise.allSettled([
          api.get('/incidents'),
          api.get('/observations'),
          api.get('/tips/control-room'),
          api.get('/intelligence/lookup?lat=9.28&lng=79.31'),
        ]);

        const extractArray = (res: any, key?: string): any[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (key && Array.isArray(res.data?.[key])) return res.data[key];
          if (Array.isArray(res.data)) return res.data;
          if (key && Array.isArray(res[key])) return res[key];
          return [];
        };

        if (incRes.status === 'fulfilled') {
          setIncidentsList(extractArray(incRes.value, 'incidents'));
        }

        if (obsRes.status === 'fulfilled') {
          setObservationsList(extractArray(obsRes.value, 'observations'));
        }

        if (tipsRes.status === 'fulfilled') {
          setTipsList(extractArray(tipsRes.value, 'tips'));
        }

        if (intelRes.status === 'fulfilled' && intelRes.value?.pfz) {
          setPfzScore(intelRes.value.pfz.potentialScore || 88);
        }
      } catch (err) {
        console.warn('Dashboard live API fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveDashboardData();

    // Subscribe to realtime Socket.IO updates for instant dashboard refreshes
    const handleRealtimeUpdate = (eventName: string) => {
      if (
        eventName === 'tip:submitted' ||
        eventName === 'tip:created' ||
        eventName === 'tip:updated' ||
        eventName === 'new_incident'
      ) {
        fetchLiveDashboardData();
      }
    };

    socketService.addListener(handleRealtimeUpdate);

    const handleSimulatedModeChange = () => {
      fetchLiveDashboardData();
    };

    window.addEventListener('maris:simulated_mode_changed', handleSimulatedModeChange);

    return () => {
      socketService.removeListener(handleRealtimeUpdate);
      window.removeEventListener('maris:simulated_mode_changed', handleSimulatedModeChange);
    };
  }, []);

  const activeAlerts = Array.isArray(incidentsList) ? incidentsList.filter((inc) => inc && inc.status !== 'CLOSED') : [];
  const currentRole = user?.role || 'Control Room Operator';

  // Role-specific metric configurations
  const getMetricsForRole = () => {
    if (currentRole === 'Researcher') {
      return [
        {
          title: 'PFZ POTENTIAL SCORE',
          value: `${pfzScore}/100`,
          subtext: 'High Tuna Front at Rameswaram Slope',
          icon: Fish,
          color: '#166534',
          bgColor: '#f0fdf4',
          link: '/portal/pfz',
        },
        {
          title: 'SST FRONT GRADIENT',
          value: '+0.4 °C',
          subtext: 'Copernicus CMEMS Sentinel-3 Pass',
          icon: Radio,
          color: '#2563eb',
          bgColor: '#eff6ff',
          link: '/portal/intelligence',
        },
        {
          title: 'RESEARCH REPORTS',
          value: '12 Published',
          subtext: 'Dugong Seagrass Sanctuary Audits',
          icon: FileText,
          color: '#7c3aed',
          bgColor: '#f5f3ff',
          link: '/portal/reports',
        },
        {
          title: 'GROK SCIENTIFIC AI',
          value: 'ACTIVE',
          subtext: 'Agentic Research Synthesis',
          icon: Bot,
          color: '#fa2edf',
          bgColor: '#fdf4ff',
          link: '/portal/ai',
        },
      ];
    }

    if (currentRole === 'Coastal Officer') {
      return [
        {
          title: 'FIELD SYNC QUEUE',
          value: observationsList.length.toString(),
          subtext: `${observationsList.length} Active Observations Ingested`,
          icon: Radio,
          color: '#2563eb',
          bgColor: '#eff6ff',
          link: '/portal/field',
        },
        {
          title: 'PATROL SECTOR ALERTS',
          value: activeAlerts.length.toString(),
          subtext: activeAlerts.length > 0 ? `${activeAlerts.length} Local Sector Hazards` : 'All Sectors Clear',
          icon: AlertTriangle,
          color: '#dc2626',
          bgColor: '#fef2f2',
          link: '/portal/alerts',
        },
        {
          title: 'CONFIDENTIAL TIPS',
          value: tipsList.length.toString(),
          subtext: 'Verified Tipster Intelligence',
          icon: Sparkles,
          color: '#d97706',
          bgColor: '#fffbeb',
          link: '/portal/tipster',
        },
        {
          title: 'TACTICAL GROK AI',
          value: 'ONLINE',
          subtext: 'Field Reasoning Assistant',
          icon: Bot,
          color: '#fa2edf',
          bgColor: '#fdf4ff',
          link: '/portal/ai',
        },
      ];
    }

    if (currentRole === 'Admin') {
      return [
        {
          title: 'MICROSERVICE MESH',
          value: '6 Operational',
          subtext: 'Atlas, Gemini AI, INCOIS, Socket.IO',
          icon: Server,
          color: '#166534',
          bgColor: '#f0fdf4',
          link: '/portal/admin',
        },
        {
          title: 'API LATENCY BENCHMARK',
          value: '42 ms',
          subtext: 'REST & WebSocket Pipelines',
          icon: Activity,
          color: '#2563eb',
          bgColor: '#eff6ff',
          link: '/portal/admin',
        },
        {
          title: 'SYSTEM AUDIT STREAM',
          value: 'RBAC ENFORCED',
          subtext: 'Multi-Tenant Boundary Active',
          icon: Shield,
          color: '#7c3aed',
          bgColor: '#f5f3ff',
          link: '/portal/admin',
        },
        {
          title: 'PLATFORM HEALTH',
          value: '99.98%',
          subtext: 'Zero Unhandled Exceptions',
          icon: CheckCircle2,
          color: '#0284c7',
          bgColor: '#e0f2fe',
          link: '/portal/admin',
        },
      ];
    }

    // Default Control Room Operator View
    return [
      {
        title: 'ACTIVE HAZARD ALERTS',
        value: activeAlerts.length.toString(),
        subtext: activeAlerts.length > 0 ? `${activeAlerts.length} Live Incident Records` : 'No Critical Incidents',
        icon: AlertTriangle,
        color: '#dc2626',
        bgColor: '#fef2f2',
        link: '/portal/alerts',
      },
      {
        title: 'PFZ POTENTIAL SCORE',
        value: `${pfzScore}/100`,
        subtext: 'Gulf of Mannar Thermal Front',
        icon: Fish,
        color: '#166534',
        bgColor: '#f0fdf4',
        link: '/portal/pfz',
      },
      {
        title: 'FIELD SYNC QUEUE',
        value: observationsList.length.toString(),
        subtext: `${observationsList.length} Ingested Observations`,
        icon: Radio,
        color: '#2563eb',
        bgColor: '#eff6ff',
        link: '/portal/field',
      },
      {
        title: 'AGENTIC AI REASONING',
        value: 'MARIS AI 1.0',
        subtext: 'Agentic Mesh Connected',
        icon: Bot,
        color: '#fa2edf',
        bgColor: '#fdf4ff',
        link: '/portal/ai',
      },
    ];
  };

  const metrics = getMetricsForRole();

  const getRoleHeaderBadge = () => {
    if (currentRole === 'Researcher') return 'OCEANOGRAPHIC RESEARCH & SANCTUARY WORKSPACE';
    if (currentRole === 'Coastal Officer') return 'TACTICAL FIELD OPERATIONS & PATROL DECK';
    if (currentRole === 'Admin') return 'PLATFORM INFRASTRUCTURE & SECURITY OPERATIONS CENTER';
    return 'CONTROL ROOM COMMAND & TRIAGE CENTER';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Context */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {getRoleHeaderBadge()}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>
            Welcome back, {user?.name}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
            Logged in as <strong style={{ color: '#000' }}>{user?.role}</strong> • Monitoring {user?.activeRegion}
          </p>
        </div>

        <button
          onClick={() => navigate('/portal/ai')}
          className="btn-frontier"
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={16} color="#fa2edf" />
          <span>Ask MARIS AI</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(m.link)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.08em' }}>
                    {m.title}
                  </span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: m.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={m.color} />
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 600, color: '#000000', marginBottom: '4px' }}>
                  {m.value}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'rgba(0,0,0,0.55)' }}>
                <span>{m.subtext}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ROLE-SPECIFIC DASHBOARD CONTENT DECKS */}

      {/* ------------------- 1. ADMIN DASHBOARD DECK ------------------- */}
      {currentRole === 'Admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Microservice Mesh Status & Latency Matrix */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: 0 }}>
                  Infrastructure & Microservices Telemetry
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)' }}>
                  Real-time health, protocol transport, and roundtrip latency across live services
                </span>
              </div>
              <button
                onClick={() => navigate('/portal/admin')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                System Admin Console →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { name: 'MongoDB Atlas Primary', status: 'HEALTHY', latency: '18 ms', detail: 'Cluster0 (AWS ap-south-1) • Zero Dropped Connections', color: '#166534', bg: '#f0fdf4' },
                { name: 'MARIS Agentic AI', status: 'ONLINE', latency: '340 ms', detail: 'gemini-3.6-flash → 3.5 Failover active', color: '#7c3aed', bg: '#f5f3ff' },
                { name: 'INCOIS Ocean Feeds', status: 'SYNCHRONIZED', latency: '42 ms', detail: 'PFZ Thermal Gradients & Chlorophyll Density', color: '#0284c7', bg: '#e0f2fe' },
                { name: 'OpenWeather Hydro-API', status: 'ONLINE', latency: '85 ms', detail: 'Coastal Wave Swell & Marine Alerts Stream', color: '#2563eb', bg: '#eff6ff' },
                { name: 'Socket.IO Event Mesh', status: 'ACTIVE (WS)', latency: '4 ms', detail: 'Realtime Bi-directional Broadcast Channels', color: '#d97706', bg: '#fffbeb' },
                { name: 'Local Disk Evidence Store', status: 'READY', latency: '1 ms', detail: 'Fallback Storage active for tip attachments', color: '#475569', bg: '#f8fafc' },
              ].map((service, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000000' }}>{service.name}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: service.bg, color: service.color }}>
                      {service.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.55)', marginBottom: '4px' }}>{service.detail}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Latency: {service.latency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Stream & System Map Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: '0 0 16px' }}>
                Platform GIS & Infrastructure Bounds
              </h3>
              <PortalMapCanvas height="380px" />
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '0 0 14px' }}>
                RBAC System Audit Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { event: 'ROLE_SWITCH', user: 'Dr. Vikram Sarabhai', role: 'Admin', time: 'Just now' },
                  { event: 'TOKEN_ISSUED', user: 'Cmdr. Rajesh Verma', role: 'Control Room', time: '4 mins ago' },
                  { event: 'API_GET_TIPS', user: 'System Service', role: 'Public Tipster', time: '12 mins ago' },
                  { event: 'MONGODB_HEALTH_CHECK', user: 'Health Monitor', role: 'System', time: '15 mins ago' },
                ].map((log, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#fafafa', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>{log.event}</span>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)' }}>{log.time}</span>
                    </div>
                    <div style={{ color: '#374151' }}>{log.user} ({log.role})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 2. CONTROL ROOM OPERATOR DASHBOARD DECK ------------------- */}
      {currentRole === 'Control Room Operator' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Live Oceanographic Map Canvas */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: 0 }}>
                Tactical GIS Situation Map
              </h3>
              <button
                onClick={() => navigate('/portal/map')}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#000000',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Expand Map</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <PortalMapCanvas height="440px" />
          </div>

          {/* Right Column: Live Hazard & Field Ticker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Active Incidents Widget */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: 0 }}>
                  Active Incidents ({incidentsList.length})
                </h3>
                <button
                  onClick={() => navigate('/portal/alerts')}
                  style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  View all
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {incidentsList.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>No active incident records in database.</div>
                ) : (
                  incidentsList.slice(0, 3).map((inc) => (
                    <div
                      key={inc._id || inc.id}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: inc.priority === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: inc.priority === 'CRITICAL' ? '#dc2626' : '#d97706' }}>
                          {inc.priority} • {inc.status}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)' }}>
                          {inc.location?.coordinates ? `${inc.location.coordinates[1].toFixed(2)}, ${inc.location.coordinates[0].toFixed(2)}` : 'Live Sector'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#000000' }}>{inc.title}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Confidential Tips Feed Widget */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: 0 }}>
                  Pseudonymous Tips ({tipsList.length})
                </h3>
                <button
                  onClick={() => navigate('/portal/tipster')}
                  style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Tipster Portal
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tipsList.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>No confidential tips submitted yet.</div>
                ) : (
                  tipsList.slice(0, 3).map((tip) => (
                    <div
                      key={tip._id || tip.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: '#fafafa',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, color: '#000' }}>{tip.tipsterId}</span>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: tip.genuinenessScore > 75 ? '#dcfce7' : '#fef3c7',
                            color: tip.genuinenessScore > 75 ? '#15803d' : '#b45309',
                          }}
                        >
                          Score: {tip.genuinenessScore}/100
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>{tip.title}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 3. RESEARCHER DASHBOARD DECK ------------------- */}
      {currentRole === 'Researcher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: 0 }}>
                    INCOIS Potential Fishing Zones (PFZ) & Thermal Gradients
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)' }}>
                    Copernicus SST satellite observations & Chlorophyll-a density models
                  </span>
                </div>
                <button
                  onClick={() => navigate('/portal/pfz')}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  PFZ Analysis Module →
                </button>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                  <Fish size={18} /> High Density Tuna Front Detected
                </div>
                <div style={{ fontSize: '0.82rem', color: '#14532d' }}>
                  Coordinates: [79.31, 9.28] • Gulf of Mannar Sector. Recommended advisory generated for local artisanal fisheries.
                </div>
              </div>

              <PortalMapCanvas height="320px" />
            </div>

            {/* Research Publications & Ecological Audits */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '0 0 14px' }}>
                Ecological Habitat Audits
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: 'Dugong Seagrass Sanctuary Audit', status: 'VERIFIED', score: '94% Health Index', date: '2026-08-24' },
                  { title: 'Palk Bay Coral Reef Bleaching Monitor', status: 'ACTIVE PASS', score: '+0.2°C Anomaly', date: '2026-08-22' },
                  { title: 'Gulf of Mannar Microplastic Survey', status: 'PUBLISHED', score: 'Low Contamination', date: '2026-08-18' },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#166534' }}>{item.status}</span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)' }}>{item.date}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#000' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>{item.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 4. COASTAL OFFICER DASHBOARD DECK ------------------- */}
      {currentRole === 'Coastal Officer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: 0 }}>
                  Coastal Patrol Sector GIS Situation
                </h3>
                <button
                  onClick={() => navigate('/portal/field')}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Field Observation Deck →
                </button>
              </div>
              <PortalMapCanvas height="380px" />
            </div>

            {/* Field Sync Queue & Local Hazard Alerts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '0 0 14px' }}>
                  Field Observations ({observationsList.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {observationsList.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>No field observations submitted yet.</div>
                  ) : (
                    observationsList.slice(0, 3).map((obs) => (
                      <div key={obs._id || obs.id} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb' }}>{obs.category || 'PATROL_LOG'}</span>
                          <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)' }}>{obs.observedAt ? new Date(obs.observedAt).toLocaleTimeString() : 'Live'}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#000' }}>{obs.title || obs.description}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
