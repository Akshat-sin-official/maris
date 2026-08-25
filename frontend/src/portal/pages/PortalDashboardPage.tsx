import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Radio,
  Fish,
  Bot,
  ArrowRight,
  Sparkles,
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

        if (incRes.status === 'fulfilled') {
          const incData = Array.isArray(incRes.value) ? incRes.value : incRes.value.data || [];
          setIncidentsList(incData);
        }

        if (obsRes.status === 'fulfilled') {
          const obsData = Array.isArray(obsRes.value) ? obsRes.value : obsRes.value.data || [];
          setObservationsList(obsData);
        }

        if (tipsRes.status === 'fulfilled') {
          const tipsData = Array.isArray(tipsRes.value) ? tipsRes.value : tipsRes.value.data || [];
          setTipsList(tipsData);
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
    return () => {
      socketService.removeListener(handleRealtimeUpdate);
    };
  }, []);

  const activeAlerts = incidentsList.filter((inc) => inc.status !== 'CLOSED');

  // Role-specific metric configurations
  const getMetricsForRole = () => {
    const role = user?.role || 'Control Room Operator';

    if (role === 'Researcher') {
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
          icon: Sparkles,
          color: '#7c3aed',
          bgColor: '#f5f3ff',
          link: '/portal/reports',
        },
        {
          title: 'GROK SCIENTIFIC AI',
          value: 'ACTIVE',
          subtext: 'xAI Agentic Research Synthesis',
          icon: Bot,
          color: '#fa2edf',
          bgColor: '#fdf4ff',
          link: '/portal/ai',
        },
      ];
    }

    if (role === 'Coastal Officer') {
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

    if (role === 'Admin') {
      return [
        {
          title: 'ADAPTER SERVICES',
          value: '6 Operational',
          subtext: 'Grok, OpenWeather, INCOIS, Copernicus',
          icon: Radio,
          color: '#166534',
          bgColor: '#f0fdf4',
          link: '/portal/admin',
        },
        {
          title: 'API LATENCY BENCHMARK',
          value: '85 ms',
          subtext: 'REST & WebSocket Pipelines',
          icon: Sparkles,
          color: '#2563eb',
          bgColor: '#eff6ff',
          link: '/portal/admin',
        },
        {
          title: 'ACTIVE INCIDENTS',
          value: incidentsList.length.toString(),
          subtext: 'MongoDB Live Collections',
          icon: AlertTriangle,
          color: '#dc2626',
          bgColor: '#fef2f2',
          link: '/portal/alerts',
        },
        {
          title: 'SYSTEM SECURITY',
          value: 'RBAC ENFORCED',
          subtext: 'Multi-Tenant Boundary Protection',
          icon: Bot,
          color: '#fa2edf',
          bgColor: '#fdf4ff',
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
        value: 'GROK 4.6 LIVE',
        subtext: 'xAI Agentic Mesh Connected',
        icon: Bot,
        color: '#fa2edf',
        bgColor: '#fdf4ff',
        link: '/portal/ai',
      },
    ];
  };

  const metrics = getMetricsForRole();

  const getRoleHeaderBadge = () => {
    const role = user?.role || 'Control Room Operator';
    if (role === 'Researcher') return 'OCEANOGRAPHIC RESEARCH & SANCTUARY WORKSPACE';
    if (role === 'Coastal Officer') return 'TACTICAL FIELD OPERATIONS & PATROL DECK';
    if (role === 'Admin') return 'PLATFORM INFRASTRUCTURE & SECURITY OPERATIONS CENTER';
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
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
          <span>Ask MARIS Grok AI</span>
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

      {/* Main Grid: Interactive Live Map & Side Ticker */}
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
              Live GIS Situation Map
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
                Live Incidents ({incidentsList.length})
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
    </div>
  );
};
