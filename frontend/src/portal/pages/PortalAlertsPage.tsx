import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { INITIAL_ALERTS, type AlertItem } from '../data/portalMockData';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PortalAlertsPage: React.FC = () => {
  const { simulatedMode } = useAuth();
  const [alertsList, setAlertsList] = useState<AlertItem[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadLiveAlerts = async () => {
      try {
        const [incRes, tipsRes] = await Promise.allSettled([
          api.get('/incidents'),
          api.get('/tips/control-room'),
        ]);

        const mappedAlerts: any[] = [];

        if (incRes.status === 'fulfilled') {
          const incidentsList = Array.isArray(incRes.value) ? incRes.value : incRes.value.data || [];
          incidentsList.forEach((inc: any) => {
            mappedAlerts.push({
              id: inc.id || inc._id,
              title: inc.title || 'Marine Incident Alert',
              type: 'HIGH_WAVE',
              severity: inc.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
              region: inc.region || 'Gulf of Mannar Sector',
              coordinates: inc.location?.coordinates ? [inc.location.coordinates[1], inc.location.coordinates[0]] : [9.28, 79.31],
              timestamp: inc.createdAt || new Date().toISOString(),
              validUntil: new Date(Date.now() + 86400000).toISOString(),
              source: 'MARIS Operational Incident Registry',
              description: inc.description || '',
              mitigationAdvice: 'Coordinate with coastal enforcement checkposts and active dispatch patrols.',
              status: inc.status === 'CLOSED' ? 'RESOLVED' : 'ACTIVE',
            });
          });
        }

        if (tipsRes.status === 'fulfilled') {
          const tipsList = Array.isArray(tipsRes.value) ? tipsRes.value : tipsRes.value.data || [];
          tipsList.forEach((tip: any) => {
            mappedAlerts.push({
              id: tip.tipsterId || tip._id,
              title: `[Tip ${tip.tipsterId}] ${tip.title}`,
              type: 'SANCTUARY_BREACH',
              severity: tip.genuinenessScore > 75 ? 'CRITICAL' : 'ADVISORY',
              region: 'Pseudonymous Tipster Feed',
              coordinates: tip.location?.coordinates ? [tip.location.coordinates[1], tip.location.coordinates[0]] : [9.28, 79.31],
              timestamp: tip.createdAt || new Date().toISOString(),
              validUntil: new Date(Date.now() + 86400000).toISOString(),
              source: `Tipster Verification Engine (Genuineness: ${tip.genuinenessScore}/100)`,
              description: tip.description || '',
              mitigationAdvice: 'Human verification recommended prior to legal enforcement.',
              status: tip.status === 'ACTIONED' ? 'RESOLVED' : 'ACTIVE',
            });
          });
        }

        setAlertsList(mappedAlerts);
      } catch (err) {
        console.warn('Failed to load live alerts from backend:', err);
      }
    };

    loadLiveAlerts();
  }, []);

  const filteredAlerts = alertsList.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const handleResolveAlert = (id: string) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' as const } : a))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
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
            <AlertTriangle size={16} color="#dc2626" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REAL-TIME HAZARD & CYCLONE RISK MATRIX
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Active Marine Alerts & Dispatches
          </h2>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'ADVISORY'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: severityFilter === sev ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
                backgroundColor: severityFilter === sev ? '#000' : '#fff',
                color: severityFilter === sev ? '#fff' : 'rgba(0,0,0,0.7)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Matrix Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.map((alt) => {
          const isCritical = alt.severity === 'CRITICAL';
          const isHigh = alt.severity === 'HIGH';

          return (
            <div
              key={alt.id}
              style={{
                backgroundColor: '#ffffff',
                border: isCritical ? '1.5px solid #fca5a5' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: isCritical ? '0 4px 20px rgba(239,68,68,0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: isCritical ? '#fee2e2' : isHigh ? '#fff7ed' : '#eff6ff',
                      color: isCritical ? '#dc2626' : isHigh ? '#c2410c' : '#2563eb',
                      border: isCritical ? '1px solid #fca5a5' : '1px solid #fed7aa',
                    }}
                  >
                    {alt.severity}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>
                    ID: {alt.id}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>Valid until: {new Date(alt.validUntil).toLocaleString()}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: '0 0 6px', color: '#000' }}>
                  {alt.title}
                </h3>
                <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.45 }}>
                  {alt.description}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)' }}>
                  Source: <strong>{alt.source}</strong> • Region: <strong>{alt.region}</strong>
                </div>
              </div>

              {/* Mitigation Guidance Box */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.06)',
                  fontSize: '0.84rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#000', marginBottom: '2px' }}>Operational Mitigation Advice:</div>
                <div style={{ color: 'rgba(0,0,0,0.7)' }}>{alt.mitigationAdvice}</div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
                  Coordinates: [{alt.coordinates[0]}, {alt.coordinates[1]}]
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {alt.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Mark as Resolved / Audited
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>✓ RESOLVED</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
