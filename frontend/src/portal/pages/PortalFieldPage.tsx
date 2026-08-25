import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw } from 'lucide-react';
import { type FieldObservation } from '../data/portalMockData';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvidenceViewer } from '../components/EvidenceViewer';

export const PortalFieldPage: React.FC = () => {
  const { simulatedMode } = useAuth();
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [obsEvidence, setObsEvidence] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (simulatedMode) return;
    observations.forEach(async (obs) => {
      if (obsEvidence[obs.id]) return;
      try {
        const res = await api.get(`/observations/${obs.id}/evidence`);
        setObsEvidence((prev) => ({ ...prev, [obs.id]: res.data?.evidence || [] }));
      } catch (err) {
        console.error('Failed to load observation evidence:', err);
      }
    });
  }, [observations, simulatedMode]);

  useEffect(() => {
    const loadLiveObservations = async () => {
      try {
        const data = await api.get('/observations');
        const raw = data.data?.observations || data.data || data;
        const obsList = Array.isArray(raw) ? raw : (Array.isArray(raw?.observations) ? raw.observations : []);
        const mapped = obsList.map((obs: any) => ({
          id: obs.id || obs._id,
          clientId: obs.clientId || 'CLIENT-LIVE-001',
          observerName: obs.observerName || obs.creator?.name || 'Coastal Observer',
          observerRole: obs.observerRole || obs.creator?.role || 'Coastal Officer',
          category: obs.category || obs.incidentType || 'VESSEL_ANOMALY',
          title: obs.title || obs.description?.split('\n')[0] || 'Unidentified Marine Observation',
          notes: obs.notes || obs.description || '',
          coordinates: obs.coordinates ? [obs.coordinates[0], obs.coordinates[1]] : obs.location?.coordinates ? [obs.location.coordinates[1], obs.location.coordinates[0]] : [9.18, 79.25],
          locationName: obs.locationName || 'Indian Territorial Waters',
          timestamp: obs.timestamp || obs.createdAt || new Date().toISOString(),
          syncState: 'SYNCED',
          verificationStatus: obs.verificationStatus || obs.verificationState || 'UNDER_REVIEW',
          confidenceScore: obs.confidenceScore || obs.confidence || 85,
        }));
        setObservations(mapped);
      } catch (err) {
        console.warn('Failed to load live observations from backend:', err);
        setObservations([]);
      }
    };

    loadLiveObservations();

    const handleModeChange = () => loadLiveObservations();
    window.addEventListener('maris:simulated_mode_changed', handleModeChange);
    return () => window.removeEventListener('maris:simulated_mode_changed', handleModeChange);
  }, []);

  const handleSimulateSync = async () => {
    const clientId = 'CLIENT-OFFLINE-' + Math.floor(Math.random() * 90000 + 10000);
    const category = 'VESSEL_ANOMALY';
    const notes = 'Drifting steel-hulled vessel without active AIS transponder signal.';
    const coordinates: [number, number] = [9.18, 79.25];

    if (!simulatedMode) {
      try {
        const payload = {
          clientId,
          sourceType: 'MOBILE_APP',
          incidentType: category,
          timestamp: new Date().toISOString(),
          location: {
            type: 'Point',
            coordinates: [coordinates[1], coordinates[0]], // [lng, lat]
          },
          description: `Unidentified Trawler near Sanctuary Limit\n${notes}`,
          confidence: 0.85,
        };
        const res = await api.post('/observations', payload);
        const mapped: FieldObservation = {
          id: res.id || res._id,
          clientId: res.clientId || clientId,
          observerName: 'S. Karuppasamy (Live)',
          observerRole: 'Coastal Guard Observer',
          category,
          title: 'Unidentified Trawler near Sanctuary Limit',
          notes,
          coordinates,
          locationName: 'Mandapam South Reef Passage',
          timestamp: res.timestamp || res.createdAt || new Date().toISOString(),
          syncState: 'SYNCED',
          verificationStatus: res.verificationState || 'UNDER_REVIEW',
          confidenceScore: res.confidence || 0.85,
        };
        setObservations((prev) => [mapped, ...prev]);
        return;
      } catch (err) {
        console.error('Failed to submit live observation, using mock fallback', err);
      }
    }

    const newObs: FieldObservation = {
      id: 'OBS-' + Math.floor(Math.random() * 900 + 100),
      clientId,
      observerName: 'S. Karuppasamy',
      observerRole: 'Coastal Guard Observer',
      category,
      title: 'Unidentified Trawler near Sanctuary Limit',
      notes,
      coordinates,
      locationName: 'Mandapam South Reef Passage',
      timestamp: new Date().toISOString(),
      syncState: 'SYNCED',
      verificationStatus: 'UNDER_REVIEW',
      confidenceScore: 0.85,
    };

    setObservations((prev) => [newObs, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: 'VERIFIED' | 'UNDER_REVIEW' | 'UNVERIFIED') => {
    setObservations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, verificationStatus: status } : o))
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
            <Radio size={16} color="#2563eb" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              OFFLINE-FIRST FIELD OBSERVATION & SYNC QUEUE
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Field Intelligence Stream
          </h2>
        </div>

        <button
          onClick={handleSimulateSync}
          className="btn-frontier"
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          <span>Simulate Incoming Field Sync</span>
        </button>
      </div>

      {/* Observation Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {observations.map((obs) => {
          const isSynced = obs.syncState === 'SYNCED';
          return (
            <div
              key={obs.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>
                    {obs.id}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: isSynced ? '#dcfce7' : '#fef3c7',
                      color: isSynced ? '#15803d' : '#b45309',
                    }}
                  >
                    SYNC: {obs.syncState}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', fontFamily: 'monospace' }}>
                    Client ID: {obs.clientId}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>
                  Captured: {new Date(obs.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'grid', gridTemplateColumns: obs.photoUrl ? 'minmax(0, 2.5fr) minmax(0, 1fr)' : '1fr', gap: '20px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 6px', color: '#000' }}>
                    {obs.title}
                  </h3>
                  <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.45 }}>
                    {obs.notes}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)' }}>
                    Observer: <strong>{obs.observerName}</strong> ({obs.observerRole}) • Location: <strong>{obs.locationName}</strong>
                  </div>
                </div>

                {obs.photoUrl && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '120px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <img src={obs.photoUrl} alt="Field Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Evidence Cabinet Section */}
              <div style={{ marginTop: '14px', borderTop: '1px dashed rgba(0,0,0,0.06)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Linked Evidence Files
                </div>
                <EvidenceViewer
                  evidenceList={
                    simulatedMode
                      ? obs.photoUrl
                        ? [
                            {
                              id: `EV-${obs.id}`,
                              mediaType: 'image',
                              url: obs.photoUrl,
                              fileHash: 'sha256_mock_hash_obs',
                              capturedAt: obs.timestamp,
                              source: 'Mobile Client',
                              syncState: 'SYNCED',
                            },
                          ]
                        : []
                      : obsEvidence[obs.id] || []
                  }
                />
              </div>

              {/* Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>
                  Verification Status: <strong style={{ color: '#000' }}>{obs.verificationStatus}</strong> (Score: {Math.round(obs.confidenceScore * 100)}%)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleUpdateStatus(obs.id, 'VERIFIED')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Verify Report
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(obs.id, 'UNDER_REVIEW')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Flag for Review
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
