import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvidenceViewer } from '../components/EvidenceViewer';

export const PortalInvestigationsPage: React.FC = () => {
  const { simulatedMode } = useAuth();
  const [casesList, setCasesList] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);

  useEffect(() => {
    const loadLiveCases = async () => {
      try {
        const res = await api.get('/incidents');
        const raw = res.data?.incidents || res.data || res;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.incidents) ? raw.incidents : []);
        if (list.length > 0) {
          const mappedCases = list.map((inc: any) => ({
            id: inc._id || inc.id,
            caseNumber: inc.caseNumber || inc.clientId || `CASE-MARIS-${Math.floor(1000 + Math.random() * 9000)}`,
            title: inc.title || 'Marine Case',
            category: inc.category || 'Vessel Sighting',
            priority: inc.priority === 'CRITICAL' || inc.priority === 'P0_CRITICAL' ? 'P0_CRITICAL' : 'P1_HIGH',
            status: inc.status === 'CLOSED' ? 'CLOSED' : 'OPEN',
            assignedTo: inc.assignedTo || 'Inspector K. Sundaram',
            location: inc.locationName || inc.location || 'Gulf of Mannar Sector',
            coordinates: inc.location?.coordinates ? [inc.location.coordinates[1], inc.location.coordinates[0]] : [9.28, 79.31],
            createdAt: inc.createdAt || new Date().toISOString(),
            updatedAt: inc.updatedAt || new Date().toISOString(),
            aiMatchScore: inc.aiMatchScore || 0.88,
            evidenceTimeline: inc.evidenceTimeline || [
              { id: 'ev-1', timestamp: '14:20', type: 'SATELLITE_PASS', description: 'Sentinel-3 thermal front overlay recorded', author: 'MARIS Agent Mesh' },
              { id: 'ev-2', timestamp: '14:45', type: 'FIELD_OBSERVATION', description: 'Geotagged observation submitted by coastal patrol unit', author: 'Field Unit #4' }
            ],
            riskAttribution: inc.riskAttribution || [
              { factor: 'Sanctuary Geofence Proximity', score: 35 },
              { factor: 'Historical Contraband Corridor Overlap', score: 30 },
              { factor: 'Vessel AIS Track Anomaly', score: 23 }
            ]
          }));
          setCasesList(mappedCases);
          setActiveCase(mappedCases[0]);
        }
      } catch (err) {
        console.warn('Failed to load live cases from backend:', err);
      }
    };

    loadLiveCases();

    const handleModeChange = () => loadLiveCases();
    window.addEventListener('maris:simulated_mode_changed', handleModeChange);
    return () => window.removeEventListener('maris:simulated_mode_changed', handleModeChange);
  }, []);

  useEffect(() => {
    if (!activeCase?.id) return;

    const loadEvidence = async () => {
      try {
        const res = await api.get(`/incidents/${activeCase.id}/evidence`);
        setEvidenceList(res.data?.evidence || []);
      } catch (err) {
        console.warn('Live evidence list check:', err);
      }
    };
    loadEvidence();
  }, [activeCase]);

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      await api.delete(`/evidence/${evidenceId}`);
      setEvidenceList((prev) => prev.filter((ev) => (ev.id || ev._id) !== evidenceId));
    } catch (err) {
      alert('Failed to delete evidence file: insufficient permissions.');
    }
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
            <ShieldAlert size={16} color="#000" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INCIDENT & HABITAT ENFORCEMENT WORKSPACE
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Active Investigation Cases
          </h2>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)' }}>
          Assigned Inspector: <strong>Dr. A. Ramanathan</strong>
        </div>
      </div>

      {/* Grid: Cases List & Investigation Workspace Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.9fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Case Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {casesList.length === 0 ? (
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#fafafa', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', color: '#6b7280' }}>
              Fetching active incident cases from live MongoDB database...
            </div>
          ) : (
            casesList.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCase(c)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isSelected ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '14px',
                    padding: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.08em' }}>
                      {c.caseNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: c.priority.includes('P0') ? '#fee2e2' : '#fef3c7',
                        color: c.priority.includes('P0') ? '#dc2626' : '#b45309',
                      }}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: '0 0 6px', color: '#000' }}>
                    {c.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)', marginBottom: '8px' }}>
                    Location: {c.location}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.45)' }}>
                    AI Pattern Match: <strong>{Math.round(c.aiMatchScore * 100)}%</strong>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Deep-Dive Investigation Workspace */}
        {activeCase ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.08em' }}>
                CASE FILE: {activeCase.caseNumber}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9' }}>
                STATUS: {activeCase.status}
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '0 0 6px' }}>
              {activeCase.title}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
              Assigned Lead: <strong>{activeCase.assignedTo}</strong> • Opened: {new Date(activeCase.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* AI Risk Attribution Factors */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              AI MULTI-FACTOR RISK ATTRIBUTION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeCase.riskAttribution.map((r: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span>{r.factor}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '120px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${r.score}%`, height: '100%', backgroundColor: '#000000' }} />
                    </div>
                    <span style={{ fontWeight: 700, width: '32px', textAlign: 'right' }}>{r.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Viewer */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              DIGITAL EVIDENCE CABINET
            </div>
            <EvidenceViewer
              evidenceList={simulatedMode ? [
                {
                  id: 'EV-MOCK-1',
                  mediaType: 'image',
                  url: 'mock1.png',
                  fileHash: 'sha256_mock_hash_1',
                  capturedAt: new Date().toISOString(),
                  source: 'Mobile App',
                  syncState: 'SYNCED',
                  uploadedBy: { name: 'Dr. A. Ramanathan', role: 'Lead Inspector' }
                }
              ] : evidenceList}
              onDelete={simulatedMode ? undefined : handleDeleteEvidence}
            />
          </div>

          {/* Evidence Timeline Stream */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              CHRONOLOGICAL EVIDENCE TIMELINE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeCase.evidenceTimeline.map((ev: any) => (
                <div
                  key={ev.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    backgroundColor: '#fafafa',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#000' }}>{ev.type}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)' }}>{new Date(ev.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ color: 'rgba(0,0,0,0.7)', marginBottom: '4px' }}>{ev.description}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.45)' }}>Source: {ev.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
};
