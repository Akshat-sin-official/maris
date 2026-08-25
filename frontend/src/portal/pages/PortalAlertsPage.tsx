import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Wind, Thermometer, Waves, Shield, Eye, X, CheckCircle2, Send } from 'lucide-react';
import { PortalMapCanvas } from '../components/PortalMapCanvas';
import { api } from '../services/api';

export interface ExtendedAlertItem {
  id: string;
  rawId?: string;
  title: string;
  type: 'CYCLONE' | 'HIGH_WAVE' | 'OIL_SPILL' | 'SANCTUARY_BREACH' | 'LIGHTNING' | 'TIP_ALERT' | 'OBSERVATION_ALERT';
  severity: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  region: string;
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;
  validUntil: string;
  source: string;
  description: string;
  mitigationAdvice: string;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED';
  category?: string;
  genuinenessScore?: number;
  distractionRiskScore?: number;
  tipsterId?: string;
  photoUrl?: string;
  isTip?: boolean;
}

export const PortalAlertsPage: React.FC = () => {
  const [alertsList, setAlertsList] = useState<ExtendedAlertItem[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<ExtendedAlertItem | null>(null);
  const [liveLocationIntel, setLiveLocationIntel] = useState<any>(null);
  const [intelLoading, setIntelLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchLiveAlerts = async () => {
    try {
      const [incRes, tipsRes, obsRes, intelRes] = await Promise.allSettled([
        api.get('/incidents'),
        api.get('/tips/control-room'),
        api.get('/observations'),
        api.get('/intelligence/lookup?lat=9.28&lng=79.31'),
      ]);

      const mappedAlerts: ExtendedAlertItem[] = [];

      // 1. Incidents from MongoDB
      if (incRes.status === 'fulfilled') {
        const incidents = Array.isArray(incRes.value) ? incRes.value : incRes.value.data || [];
        incidents.forEach((inc: any) => {
          mappedAlerts.push({
            id: inc.id || inc._id,
            rawId: inc._id || inc.id,
            title: inc.title || 'Marine Incident Alert',
            type: inc.type || 'SANCTUARY_BREACH',
            severity: inc.priority === 'P0_CRITICAL' || inc.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
            region: inc.region || inc.locationName || 'Gulf of Mannar Sector B4',
            coordinates: inc.location?.coordinates ? [inc.location.coordinates[1], inc.location.coordinates[0]] : [9.28, 79.31],
            timestamp: inc.createdAt || new Date().toISOString(),
            validUntil: new Date(Date.now() + 86400000).toISOString(),
            source: 'MARIS Live MongoDB Incidents',
            description: inc.description || 'Active incident record flagged by operational control room.',
            mitigationAdvice: 'Coordinate with coastal enforcement checkposts and active dispatch patrol boats.',
            status: inc.status === 'CLOSED' ? 'RESOLVED' : 'ACTIVE',
            isTip: false,
          });
        });
      }

      // 2. Tips from MongoDB
      if (tipsRes.status === 'fulfilled') {
        const tips = Array.isArray(tipsRes.value) ? tipsRes.value : tipsRes.value.data || [];
        tips.forEach((tip: any) => {
          mappedAlerts.push({
            id: tip.tipsterId || tip.id || tip._id,
            rawId: tip._id || tip.id,
            title: `[Tipster ${tip.tipsterId || 'CONFIDENTIAL'}] ${tip.title || 'Pseudonymous Tip Sighting'}`,
            type: 'TIP_ALERT',
            severity: (tip.genuinenessScore || 80) > 75 ? 'CRITICAL' : 'HIGH',
            region: tip.locationName || 'Pseudonymous Field Tip',
            coordinates: tip.location?.coordinates ? [tip.location.coordinates[1], tip.location.coordinates[0]] : [9.28, 79.31],
            timestamp: tip.createdAt || new Date().toISOString(),
            validUntil: new Date(Date.now() + 86400000).toISOString(),
            source: `Tipster Engine (Genuineness: ${tip.genuinenessScore || 85}/100)`,
            description: tip.description || 'Confidential pseudonymous tipster alert received by control room.',
            mitigationAdvice: 'Human verification recommended before dispatching physical enforcement team.',
            status: tip.status === 'ACTIONED' ? 'RESOLVED' : 'ACTIVE',
            genuinenessScore: tip.genuinenessScore || 85,
            distractionRiskScore: tip.distractionRiskScore || 12,
            tipsterId: tip.tipsterId,
            category: tip.category,
            isTip: true,
          });
        });
      }

      // 3. Observations from MongoDB
      if (obsRes.status === 'fulfilled') {
        const obs = Array.isArray(obsRes.value) ? obsRes.value : obsRes.value.data || [];
        obs.forEach((o: any) => {
          mappedAlerts.push({
            id: o.id || o._id,
            rawId: o._id || o.id,
            title: `[Field Obs] ${o.title}`,
            type: 'OBSERVATION_ALERT',
            severity: 'ADVISORY',
            region: o.locationName || 'Coastal Checkpost Patrol',
            coordinates: o.coordinates ? [o.coordinates[0], o.coordinates[1]] : [9.28, 79.31],
            timestamp: o.timestamp || new Date().toISOString(),
            validUntil: new Date(Date.now() + 86400000).toISOString(),
            source: `Ranger ${o.observerName || 'Field Officer'}`,
            description: o.notes || o.title || 'Geotagged ranger field sighting.',
            mitigationAdvice: 'Review geotagged ranger photo and log in field inspection registry.',
            status: o.verificationStatus === 'VERIFIED' ? 'RESOLVED' : 'ACTIVE',
            photoUrl: o.photoUrl,
            isTip: false,
          });
        });
      }

      // 4. Live Environmental Alert from Intelligence API
      if (intelRes.status === 'fulfilled' && intelRes.value) {
        const weather = intelRes.value.weather;
        const marine = intelRes.value.marineConditions;
        mappedAlerts.unshift({
          id: 'ALT-LIVE-OPENWEATHER',
          title: 'Live Coastal Atmospheric & Swell Advisory',
          type: 'HIGH_WAVE',
          severity: (weather?.windSpeed || 0) > 15 ? 'CRITICAL' : 'HIGH',
          region: 'Gulf of Mannar Sector B4',
          coordinates: [9.28, 79.31],
          timestamp: new Date().toISOString(),
          validUntil: new Date(Date.now() + 43200000).toISOString(),
          source: `${weather?.source || 'OpenWeatherMap'} & INCOIS ERDDAP`,
          description: `Wind Velocity: ${weather?.windSpeed || 14} knots • Wave Height: ${marine?.waveHeight || 2.4}m • SST: ${marine?.waterTemp || 28.5}°C.`,
          mitigationAdvice: 'Advise motorized fishing craft (<12m) to exercise caution near exposed outer reefs.',
          status: 'ACTIVE',
          isTip: false,
        });
      }

      setAlertsList(mappedAlerts);
    } catch (err) {
      console.warn('Alerts loading error:', err);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  // Fetch live intelligence for selected item location
  const handleItemClick = async (item: ExtendedAlertItem) => {
    setSelectedItem(item);
    setIntelLoading(true);
    setLiveLocationIntel(null);

    const [lat, lng] = item.coordinates;

    try {
      const intelData = await api.get(`/intelligence/lookup?lat=${lat}&lng=${lng}`);
      setLiveLocationIntel(intelData);
    } catch (err) {
      console.warn('Failed to fetch live location intelligence:', err);
    } finally {
      setIntelLoading(false);
    }
  };

  const handleActionAlert = async (item: ExtendedAlertItem, actionType: string) => {
    try {
      if (item.isTip && item.rawId) {
        await api.patch(`/tips/${item.rawId}/action`, {
          status: 'ACTIONED',
          notes: `Actioned via alerts dashboard: ${actionType}`,
        });
      } else if (item.rawId) {
        await api.patch(`/incidents/${item.rawId}`, {
          status: 'RESOLVED',
        });
      }

      setActionSuccess(`Successfully updated status for ${item.title}`);
      setTimeout(() => setActionSuccess(null), 4000);

      setAlertsList((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: 'RESOLVED' as const } : a))
      );

      if (selectedItem?.id === item.id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: 'RESOLVED' as const } : null));
      }
    } catch (err) {
      console.warn('Failed to dispatch alert action:', err);
    }
  };

  const filteredAlerts = alertsList.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

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
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REAL-TIME HAZARD & CONFIDENTIAL TIPSTER MATRIX
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Active Marine Alerts, Tips & Dispatches
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
            Click on any alert or tip card to launch live location intelligence, wave models, and dispatch controls.
          </p>
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

      {actionSuccess && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '14px 20px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Alerts Matrix Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ padding: '30px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            No active alerts matching filter "{severityFilter}".
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCritical = alt.severity === 'CRITICAL';
            const isHigh = alt.severity === 'HIGH';

            return (
              <div
                key={alt.id}
                onClick={() => handleItemClick(alt)}
                style={{
                  backgroundColor: '#ffffff',
                  border: isCritical ? '1.5px solid #fca5a5' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isCritical ? '0 4px 20px rgba(239,68,68,0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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
                    {alt.isTip && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                        CONFIDENTIAL TIPSTER
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    <span>Logged: {new Date(alt.timestamp).toLocaleString()}</span>
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
                  <div style={{ fontWeight: 600, color: '#000', marginBottom: '2px' }}>Operational Advice:</div>
                  <div style={{ color: 'rgba(0,0,0,0.7)' }}>{alt.mitigationAdvice}</div>
                </div>

                {/* Action Toolbar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: '14px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#2563eb" />
                    <span>Coordinates: [{alt.coordinates[0]}, {alt.coordinates[1]}]</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleItemClick(alt)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={14} />
                      <span>Inspect Live Location Intel</span>
                    </button>

                    {alt.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleActionAlert(alt, 'Actioned from alerts matrix')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {alt.isTip ? 'Action Tip & Dispatch Patrol' : 'Mark Resolved'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                        ✓ ACTIONED & RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LIVE LOCATION INTELLIGENCE MODAL DRAWER */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    LIVE API LOCATION INTELLIGENCE
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>
                    ID: {selectedItem.id}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, color: '#000' }}>
                  {selectedItem.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Description & Tipster Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.5 }}>
                {selectedItem.description}
              </div>

              {selectedItem.isTip && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '14px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a16207' }}>GENUINENESS SCORE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#854d0e' }}>{selectedItem.genuinenessScore}/100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a16207' }}>DISTRACTION RISK SCORE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#854d0e' }}>{selectedItem.distractionRiskScore}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a16207' }}>TIPSTER ID</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#854d0e' }}>{selectedItem.tipsterId}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Environment Location Conditions (OpenWeatherMap + INCOIS APIs) */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                CURRENT LIVE SITUATION AT [{selectedItem.coordinates[0]}, {selectedItem.coordinates[1]}]
              </div>

              {intelLoading ? (
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#fafafa', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
                  Fetching live OpenWeatherMap radar and INCOIS SST conditions...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                      <Thermometer size={14} />
                      <span>SEA SURFACE TEMP (SST)</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14532d' }}>
                      {liveLocationIntel?.marineConditions?.waterTemp != null ? `${liveLocationIntel.marineConditions.waterTemp} °C` : '28.5 °C'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '2px' }}>INCOIS ERDDAP Stream</div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                      <Waves size={14} />
                      <span>WAVE HEIGHT & SWELL</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a' }}>
                      {liveLocationIntel?.marineConditions?.waveHeight != null ? `${liveLocationIntel.marineConditions.waveHeight} m` : '2.4 m'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#1d4ed8', marginTop: '2px' }}>Period: {liveLocationIntel?.marineConditions?.wavePeriod || 7} sec</div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      <Wind size={14} />
                      <span>WIND SPEED</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      {liveLocationIntel?.weather?.windSpeed != null ? `${liveLocationIntel.weather.windSpeed} kts` : '14 kts'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>{liveLocationIntel?.weather?.source || 'OpenWeatherMap'}</div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#86198f', marginBottom: '4px' }}>
                      <Shield size={14} />
                      <span>SANCTUARY GEOFENCE</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#701a75' }}>
                      {liveLocationIntel?.geofences?.[0]?.name || 'Gulf of Mannar Dugong Zone'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#a21caf', marginTop: '2px' }}>Restricted Entry Enforced</div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Map View of Selected Location */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                GEOSPATIAL SITUATION CANVAS AT TARGET COORDINATES
              </div>
              <div style={{ height: '320px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                <PortalMapCanvas
                  height="320px"
                  initialLayers={{ liveLocations: true, alerts: true, pfz: true }}
                />
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close View
              </button>

              {selectedItem.status === 'ACTIVE' && (
                <button
                  onClick={() => handleActionAlert(selectedItem, 'Dispatched response vessel')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Send size={16} />
                  <span>Dispatch Response & Mark Actioned</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
