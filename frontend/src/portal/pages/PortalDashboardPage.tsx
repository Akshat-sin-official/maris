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
import { INITIAL_ALERTS, INITIAL_FIELD_OBSERVATIONS } from '../data/portalMockData';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PortalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, simulatedMode } = useAuth();
  const [activeAlertsCount, setActiveAlertsCount] = useState(INITIAL_ALERTS.filter(a => a.status === 'ACTIVE').length);
  const [fieldSyncCount, setFieldSyncCount] = useState(INITIAL_FIELD_OBSERVATIONS.length);

  useEffect(() => {
    if (simulatedMode) {
      setActiveAlertsCount(INITIAL_ALERTS.filter(a => a.status === 'ACTIVE').length);
      setFieldSyncCount(INITIAL_FIELD_OBSERVATIONS.length);
      return;
    }

    const fetchLiveMetrics = async () => {
      try {
        const incidents = await api.get('/incidents');
        const listInc = Array.isArray(incidents) ? incidents : incidents.data || [];
        setActiveAlertsCount(listInc.filter((inc: any) => inc.status !== 'CLOSED').length);

        const observations = await api.get('/observations');
        const listObs = Array.isArray(observations) ? observations : observations.data || [];
        setFieldSyncCount(listObs.length);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics, using mock baseline', err);
      }
    };

    fetchLiveMetrics();
  }, [simulatedMode]);

  const metrics = [
    {
      title: 'ACTIVE HAZARD ALERTS',
      value: activeAlertsCount.toString(),
      subtext: activeAlertsCount > 0 ? `${activeAlertsCount} Live Control Feeds` : 'No Critical Alerts',
      icon: AlertTriangle,
      color: '#dc2626',
      bgColor: '#fef2f2',
      link: '/portal/alerts',
    },
    {
      title: 'PFZ POTENTIAL SCORE',
      value: '92/100',
      subtext: 'High Tuna Front at Rameswaram Slope',
      icon: Fish,
      color: '#166534',
      bgColor: '#f0fdf4',
      link: '/portal/pfz',
    },
    {
      title: 'FIELD SYNC QUEUE',
      value: fieldSyncCount.toString(),
      subtext: `${fieldSyncCount} Observations Tracked`,
      icon: Radio,
      color: '#2563eb',
      bgColor: '#eff6ff',
      link: '/portal/field',
    },
    {
      title: 'AGENTIC AI REASONING',
      value: 'OPERATIONAL',
      subtext: '8 Multi-agent workflows connected',
      icon: Bot,
      color: '#fa2edf',
      bgColor: '#fdf4ff',
      link: '/portal/ai',
    },
  ];

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
              OPERATIONAL SITUATION SUMMARY
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
          <span>Ask MARIS AI Agent</span>
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
              Live Marine Situation Map
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
          {/* Active Hazards Widget */}
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
                Active Hazards
              </h3>
              <button
                onClick={() => navigate('/portal/alerts')}
                style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                View all ({INITIAL_ALERTS.length})
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {INITIAL_ALERTS.slice(0, 2).map((alt) => (
                <div
                  key={alt.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    backgroundColor: alt.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: alt.severity === 'CRITICAL' ? '#dc2626' : '#d97706' }}>
                      {alt.severity}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)' }}>{alt.region}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#000000' }}>{alt.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Field Observations Widget */}
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
                Field Intelligence Feed
              </h3>
              <button
                onClick={() => navigate('/portal/field')}
                style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Sync Queue
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {INITIAL_FIELD_OBSERVATIONS.map((obs) => (
                <div
                  key={obs.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    backgroundColor: '#fafafa',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#000' }}>{obs.title}</span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: obs.syncState === 'SYNCED' ? '#dcfce7' : '#fef3c7',
                        color: obs.syncState === 'SYNCED' ? '#15803d' : '#b45309',
                      }}
                    >
                      {obs.syncState}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)' }}>By {obs.observerName} • {obs.locationName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
