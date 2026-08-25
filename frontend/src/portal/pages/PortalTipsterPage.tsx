import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Send,
  Lock,
  CheckCircle,
  RefreshCw,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { socketService } from '../services/socket';

export const PortalTipsterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'audit'>('audit');

  // Submit Tip Form State
  const [category, setCategory] = useState('SUSPICIOUS_VESSEL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('9.28');
  const [lng, setLng] = useState('79.31');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Track Tip Form State
  const [lookupId, setLookupId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Control Room Tips List State
  const [controlRoomTips, setControlRoomTips] = useState<any[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchControlRoomTips = async () => {
    setIsLoadingTips(true);
    try {
      const res = await api.get('/tips/control-room');
      const data = Array.isArray(res) ? res : res.data || [];
      setControlRoomTips(data);
    } catch (err: any) {
      console.warn('Failed to load control room tips from backend:', err);
    } finally {
      setIsLoadingTips(false);
    }
  };

  useEffect(() => {
    fetchControlRoomTips();

    // Subscribe to realtime Socket.IO updates for live tip arrivals
    const handleTipEvent = (eventName: string) => {
      if (eventName === 'tip:submitted' || eventName === 'tip:created' || eventName === 'tip:updated') {
        fetchControlRoomTips();
      }
    };

    socketService.addListener(handleTipEvent);
    return () => {
      socketService.removeListener(handleTipEvent);
    };
  }, []);

  const getDeviceMetadata = () => ({
    deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP',
    browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser',
    os: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const payload = {
        category,
        title,
        description,
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng) || 79.31, parseFloat(lat) || 9.28],
        },
        evidence: [],
        clientMetadata: getDeviceMetadata(),
      };

      const res = await api.post('/tips/submit', payload);
      setSubmitResult(res.data || res);
      setTitle('');
      setDescription('');
      fetchControlRoomTips();
    } catch (err: any) {
      console.error('Tip submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setTrackedRecord(null);

    try {
      const res = await api.get(`/tips/track/${lookupId.trim().toUpperCase()}`);
      setTrackedRecord(res.data || res);
    } catch (err: any) {
      setSearchError('No matching tip record found. Please verify your 10-digit Tipster ID.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateStatus = async (tipId: string, newStatus: string) => {
    try {
      await api.patch(`/tips/${tipId}/status`, {
        status: newStatus,
        reviewNotes: `Status changed to ${newStatus} by Control Room Operator`,
      });

      setActionNotice(`Tip status updated to ${newStatus}`);
      setTimeout(() => setActionNotice(null), 4000);
      fetchControlRoomTips();
    } catch (err: any) {
      console.error('Failed to update tip status:', err);
    }
  };

  const handleConvertToIncident = async (tipId: string) => {
    try {
      const res = await api.post(`/tips/${tipId}/convert-to-incident`, {});
      const incident = res.data?.incident || res.incident;

      setActionNotice(`Successfully converted tip into Incident ${incident?.incidentId || 'INC-NEW'}`);
      fetchControlRoomTips();

      setTimeout(() => {
        navigate('/portal/investigations');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to convert tip to incident:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Top Banner Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldAlert size={18} color="#dc2626" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PUBLIC TIPSTER & CONTROL ROOM AUDIT DECK
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 500, margin: 0 }}>
            Confidential Tip Triage & Security Provenance
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'rgba(0,0,0,0.6)', maxWidth: '700px' }}>
            Review incoming pseudonymous citizen reports, calculate genuineness scores, inspect device IP provenance, and convert verified tips into operational incidents.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeTab === 'audit' ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: activeTab === 'audit' ? '#000' : '#fff',
              color: activeTab === 'audit' ? '#fff' : 'rgba(0,0,0,0.7)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Control Room Audit ({controlRoomTips.length})
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeTab === 'submit' ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: activeTab === 'submit' ? '#000' : '#fff',
              color: activeTab === 'submit' ? '#fff' : 'rgba(0,0,0,0.7)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Submit Tip
          </button>
          <button
            onClick={() => setActiveTab('track')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeTab === 'track' ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: activeTab === 'track' ? '#000' : '#fff',
              color: activeTab === 'track' ? '#fff' : 'rgba(0,0,0,0.7)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Track Tip ID
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.88rem', fontWeight: 600 }}>
          ✓ {actionNotice}
        </div>
      )}

      {/* TAB 1: CONTROL ROOM AUDIT VIEW */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0, color: '#000' }}>
              Live Confidential Tipster Log ({controlRoomTips.length})
            </h3>
            <button
              onClick={fetchControlRoomTips}
              disabled={isLoadingTips}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} className={isLoadingTips ? 'animate-spin' : ''} />
              <span>Refresh Log</span>
            </button>
          </div>

          {controlRoomTips.length === 0 ? (
            <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center', color: '#6b7280' }}>
              No confidential tips logged yet in MongoDB Atlas. Submit a tip to view real-time triage.
            </div>
          ) : (
            controlRoomTips.map((tip) => {
              const isHighScore = (tip.genuinenessScore || 50) >= 75;

              return (
                <div
                  key={tip._id || tip.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isHighScore ? '1.5px solid #a7f3d0' : '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857', fontFamily: 'monospace' }}>
                        {tip.tipsterId}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                        {tip.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: tip.status === 'ACTIONED' ? '#dcfce7' : '#fef3c7', color: tip.status === 'ACTIONED' ? '#15803d' : '#b45309' }}>
                        STATUS: {tip.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Logged: {new Date(tip.createdAt || tip.reportedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 6px', color: '#000' }}>
                      {tip.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.45 }}>
                      {tip.description}
                    </p>
                  </div>
                  
                  {/* Genuineness Score & Provenance Metadata Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>EVIDENCE CORRELATION SCORE</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: tip.distractionRisk === 'HIGH' ? '#991b1b' : isHighScore ? '#047857' : '#b45309' }}>
                        {tip.genuinenessScore || 0}/100 ({tip.distractionRisk || 'HIGH'} RISK)
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>BACKGROUND DEVICE PROVENANCE</div>
                      <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
                        {tip.clientMetadata?.deviceType || 'DESKTOP'} • IP: {tip.clientMetadata?.ipAddress || '127.0.0.1'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {tip.clientMetadata?.browser || 'Chrome'} ({tip.clientMetadata?.os || 'OS'}) • {tip.clientMetadata?.screenResolution || '1920x1080'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>GEOTAG COORDINATES</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                        [{tip.location?.coordinates?.[1] || 9.28}, {tip.location?.coordinates?.[0] || 79.31}]
                      </div>
                    </div>
                  </div>

                  {/* 4-FACTOR DETERMINISTIC BREAKDOWN */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '10px 14px', backgroundColor: '#f1f5f9', borderRadius: '10px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block' }}>SPATIAL CORRELATION</span>
                      <strong style={{ color: '#0f172a' }}>{tip.verificationFactors?.spatialCorrelation || 0} / 30</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block' }}>HISTORICAL PATTERN</span>
                      <strong style={{ color: '#0f172a' }}>{tip.verificationFactors?.historicalPatternMatch || 0} / 30</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block' }}>MEDIA PROVENANCE</span>
                      <strong style={{ color: '#0f172a' }}>{tip.verificationFactors?.mediaProvenanceScore || 0} / 20</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block' }}>MARINE WEATHER</span>
                      <strong style={{ color: '#0f172a' }}>{tip.verificationFactors?.marineWeatherFeasibility || 0} / 20</strong>
                    </div>
                  </div>

                  {/* EVIDENCE CORROBORATION DETAILS */}
                  {tip.evidenceSummary && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', padding: '12px', borderRadius: '10px', backgroundColor: '#fafafa', border: '1px solid #f0f0f0' }}>
                      {tip.evidenceSummary.supporting?.length > 0 && (
                        <div>
                          <strong style={{ color: '#166534', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Supporting Evidence:</strong>
                          <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#374151' }}>
                            {tip.evidenceSummary.supporting.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {tip.evidenceSummary.contradicting?.length > 0 && (
                        <div>
                          <strong style={{ color: '#991b1b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠ Contradicting Signals:</strong>
                          <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#7f1d1d' }}>
                            {tip.evidenceSummary.contradicting.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {tip.evidenceSummary.noCorroboration?.length > 0 && (
                        <div>
                          <strong style={{ color: '#4b5563', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>○ No Independent Corroboration:</strong>
                          <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#6b7280' }}>
                            {tip.evidenceSummary.noCorroboration.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {tip.evidenceSummary.unavailable?.length > 0 && (
                        <div>
                          <strong style={{ color: '#b45309', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>◌ Data Source Unavailable:</strong>
                          <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#92400e' }}>
                            {tip.evidenceSummary.unavailable.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AGENT EXECUTION TRACE */}
                  {tip.agentTrace && tip.agentTrace.length > 0 && (
                    <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '0.74rem' }}>
                      <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>AGENT EXECUTION AUDIT TRACE</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', color: '#334155' }}>
                        {tip.agentTrace.map((tr: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: '#0284c7', fontWeight: 700 }}>[{tr.agent}]</span>
                            <span>{tr.action}</span>
                            <span style={{ color: '#94a3b8', marginLeft: 'auto' }}>{new Date(tr.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateStatus(tip._id || tip.id, 'UNDER_REVIEW')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark Under Review
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tip._id || tip.id, 'VERIFIED')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Verify Tip
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tip._id || tip.id, 'REJECTED')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>

                    {tip.status !== 'ACTIONED' && (
                      <button
                        onClick={() => handleConvertToIncident(tip._id || tip.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ArrowRight size={14} />
                        <span>Convert to Incident & Action</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT TIP FORM */}
      {activeTab === 'submit' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Send size={18} color="#000" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0 }}>
              Submit Anonymous Coastal Tip
            </h3>
          </div>
          {submitResult ? (
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={20} />
                <h3 style={{ margin: 0 }}>Tip Submitted: {submitResult.tipsterId}</h3>
              </div>
              <p style={{ margin: '4px 0' }}>Genuineness Score: {submitResult.genuinenessScore}/100</p>
              <button
                onClick={() => setSubmitResult(null)}
                style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#166534', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                >
                  <option value="SUSPICIOUS_VESSEL">SUSPICIOUS VESSEL</option>
                  <option value="ILLEGAL_FISHING">ILLEGAL FISHING</option>
                  <option value="OIL_POLLUTION">OIL POLLUTION / SPILL</option>
                  <option value="CONTRABAND_SMUGGLING">CONTRABAND / SMUGGLING</option>
                  <option value="DISTRESS_BEACON">DISTRESS BEACON</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unidentified trawler near marine sanctuary..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>DESCRIPTION & OBSERVATION DETAILS</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any visual details, hull markings, estimated heading, or crew activity..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>LATITUDE</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="9.28"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>LONGITUDE</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="79.31"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#6b7280' }}>
                <Lock size={14} />
                <span>Encrypted telemetry & zero-PII anonymous hashing active.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: '12px 24px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Coastal Tip'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: TRACK TIP LOOKUP */}
      {activeTab === 'track' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Search size={18} color="#000" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0 }}>
              Track Tip Status
            </h3>
          </div>
          <form onSubmit={handleTrackLookup} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              required
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter 10-digit Tipster ID (e.g. MARIS-9382-7410)..."
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              disabled={isSearching}
              style={{ padding: '12px 24px', backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Search size={16} />
              <span>{isSearching ? 'Searching...' : 'Track'}</span>
            </button>
          </form>

          {searchError && (
            <div style={{ padding: '14px 18px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span>{searchError}</span>
            </div>
          )}

          {trackedRecord && (
            <div style={{ marginTop: '16px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid rgba(0,0,0,0.08)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{trackedRecord.title}</h4>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#475569' }}>{trackedRecord.description}</p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#e2e8f0' }}>
                  Status: {trackedRecord.status}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Updated: {new Date(trackedRecord.updatedAt || trackedRecord.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
