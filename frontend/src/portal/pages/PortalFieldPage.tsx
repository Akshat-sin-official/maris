import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  RefreshCw,
  Plus,
  Search,
  ShieldAlert,
  MapPin,
  Clock,
  User,
  Filter,
  Check,
  X,
  Eye,
  FileCheck
} from 'lucide-react';
import { type FieldObservation } from '../data/portalMockData';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { socketService } from '../services/socket';

export const PortalFieldPage: React.FC = () => {
  const navigate = useNavigate();
  const { simulatedMode, user } = useAuth();
  
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [obsEvidence, setObsEvidence] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Detail Modal State
  const [selectedObsForDetail, setSelectedObsForDetail] = useState<FieldObservation | null>(null);

  // Modal State for New Observation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'vessel_sighting',
    notes: '',
    confidence: 0.85,
    latitude: '9.2800',
    longitude: '79.3100',
    locationName: 'Gulf of Mannar Sector',
  });

  // Check URL Search Params on mount (?lat=...&lon=...&openCreate=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const latParam = params.get('lat');
    const lonParam = params.get('lon') || params.get('lng');
    const openParam = params.get('openCreate');

    if (latParam && lonParam) {
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(latParam).toFixed(4),
        longitude: parseFloat(lonParam).toFixed(4),
        locationName: `Sector [${parseFloat(latParam).toFixed(2)}, ${parseFloat(lonParam).toFixed(2)}]`,
      }));
    }

    if (openParam === 'true') {
      setIsCreateModalOpen(true);
    }
  }, []);

  // Fetch Live Observations
  const loadLiveObservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/observations');
      const raw = res.data?.observations || res.data || res;
      const obsList = Array.isArray(raw) ? raw : (Array.isArray(raw?.observations) ? raw.observations : []);
      
      const mapped: FieldObservation[] = obsList.map((obs: any) => {
        const coords = obs.location?.coordinates
          ? [obs.location.coordinates[1], obs.location.coordinates[0]] // [lat, lon]
          : obs.coordinates || [9.28, 79.31];

        const verificationStatus =
          obs.verification?.status === 'VERIFIED'
            ? 'VERIFIED'
            : obs.verification?.status === 'REJECTED'
            ? 'REJECTED'
            : obs.verificationStatus || 'UNDER_REVIEW';

        return {
          id: obs._id || obs.id,
          clientId: obs.clientId || 'CLIENT-LIVE-001',
          observerName: obs.observerId?.name || obs.observerName || obs.creator?.name || 'Patrol Unit #4',
          observerRole: obs.observerId?.role || obs.observerRole || 'Coastal Guard Officer',
          category: obs.category || 'vessel_sighting',
          title: obs.title || (obs.value ? obs.value.split('\n')[0] : 'Marine Field Observation'),
          notes: obs.value || obs.notes || obs.description || '',
          coordinates: coords as [number, number],
          locationName: obs.locationName || `Indian Maritime Grid [${coords[0]?.toFixed(2)}, ${coords[1]?.toFixed(2)}]`,
          timestamp: obs.timestamp || obs.createdAt || new Date().toISOString(),
          syncState: 'SYNCED',
          verificationStatus,
          confidenceScore: obs.confidence || 0.85,
        };
      });

      setObservations(mapped);
    } catch (err) {
      console.warn('Failed to load observations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveObservations();
  }, [simulatedMode]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const token = localStorage.getItem('maris_jwt_token') || 'mock-token';
    socketService.connect(token, (eventName) => {
      if (eventName === 'observation_received' || eventName === 'verification_completed') {
        loadLiveObservations();
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Fetch evidence for each observation
  useEffect(() => {
    if (simulatedMode) return;
    observations.forEach(async (obs) => {
      if (obsEvidence[obs.id]) return;
      try {
        const res = await api.get(`/observations/${obs.id}/evidence`);
        setObsEvidence((prev) => ({ ...prev, [obs.id]: res.data?.evidence || [] }));
      } catch (err) {
        // Evidence check silent fallback
      }
    });
  }, [observations, simulatedMode]);

  // Handle Observation Submission with Evidence Upload
  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormFeedback(null);

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setFormFeedback('Please enter valid numeric latitude and longitude coordinates.');
      setSubmitting(false);
      return;
    }

    try {
      const evidenceIds: string[] = [];

      // If user attached a file, upload to /api/v1/evidence/upload
      if (selectedFile) {
        const formPayload = new FormData();
        formPayload.append('file', selectedFile);
        const token = localStorage.getItem('maris_jwt_token');

        const uploadRes = await fetch('/api/v1/evidence/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formPayload,
        });

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          if (uploadJson?.data?.evidence?._id) {
            evidenceIds.push(uploadJson.data.evidence._id);
          }
        }
      }

      const payload = {
        category: formData.category,
        value: `${formData.title}\n${formData.notes}`,
        confidence: formData.confidence,
        location: {
          type: 'Point',
          coordinates: [lon, lat], // GeoJSON [lng, lat]
        },
        evidenceIds,
        timestamp: new Date().toISOString(),
      };

      await api.post('/observations', payload);
      setIsCreateModalOpen(false);
      setSelectedFile(null);
      setFormData({
        title: '',
        category: 'vessel_sighting',
        notes: '',
        confidence: 0.85,
        latitude: '9.2800',
        longitude: '79.3100',
        locationName: 'Gulf of Mannar Sector',
      });
      loadLiveObservations();
    } catch (err: any) {
      setFormFeedback(err.message || 'Failed to submit observation. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Live Verification Handlers
  const handleVerifyObservation = async (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.patch(`/observations/${id}`, {
        verification: {
          status: newStatus,
          notes: `${newStatus === 'VERIFIED' ? 'Verified' : 'Rejected'} by Control Room Officer`,
        },
      });
      setObservations(prev =>
        prev.map(obs => (obs.id === id ? { ...obs, verificationStatus: newStatus } : obs))
      );
      if (selectedObsForDetail && selectedObsForDetail.id === id) {
        setSelectedObsForDetail(prev => prev ? { ...prev, verificationStatus: newStatus } : null);
      }
    } catch (err: any) {
      alert(`Verification action failed: ${err?.message || 'Unauthorized or server error'}`);
    }
  };

  // Filter Observations
  const filteredObservations = observations.filter(obs => {
    const matchesSearch =
      searchQuery === '' ||
      obs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.observerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      obs.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'VERIFIED' && obs.verificationStatus === 'VERIFIED') ||
      (selectedStatus === 'REJECTED' && obs.verificationStatus === 'REJECTED') ||
      (selectedStatus === 'UNVERIFIED' && obs.verificationStatus !== 'VERIFIED' && obs.verificationStatus !== 'REJECTED');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = observations.length;
  const verifiedCount = observations.filter(o => o.verificationStatus === 'VERIFIED').length;
  const pendingCount = observations.filter(o => o.verificationStatus !== 'VERIFIED' && o.verificationStatus !== 'REJECTED').length;
  const rejectedCount = observations.filter(o => o.verificationStatus === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Action Header */}
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
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Radio size={16} color="#00f2fe" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MARITIME FIELD INTELLIGENCE & SYNC STREAM
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, color: '#0f172a' }}>
            Field Observations Workspace
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setRefreshing(true);
              loadLiveObservations();
            }}
            disabled={refreshing}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={16} />
            <span>New Observation</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL OBSERVATIONS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fef08a', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#854d0e', fontWeight: 600, textTransform: 'uppercase' }}>PENDING VERIFICATION</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>{pendingCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>VERIFIED EVIDENCE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{verifiedCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase' }}>REJECTED / UNCONFIRMED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search observations by keyword, officer, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <Filter size={14} color="#64748b" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)',
                backgroundColor: '#ffffff',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="vessel_sighting">Vessel Sighting</option>
              <option value="wildlife">Wildlife Entanglement</option>
              <option value="weather_hazard">Weather Hazard</option>
              <option value="sst">SST Thermal Anomaly</option>
              <option value="chlorophyll">Chlorophyll Bloom</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
            {['ALL', 'UNVERIFIED', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  border: 'none',
                  background: selectedStatus === st ? '#ffffff' : 'transparent',
                  color: selectedStatus === st ? '#0f172a' : '#64748b',
                  fontWeight: selectedStatus === st ? 700 : 500,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  boxShadow: selectedStatus === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Observation Cards Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px' }}>
            Loading live field observations from MongoDB Atlas...
          </div>
        ) : filteredObservations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)' }}>
            No field observations match your selected filter criteria.
          </div>
        ) : (
          filteredObservations.map((obs) => {
            const isVerified = obs.verificationStatus === 'VERIFIED';
            const isRejected = obs.verificationStatus === 'REJECTED';

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
                {/* Header info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {obs.id.slice(-8)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: isVerified ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                        color: isVerified ? '#15803d' : isRejected ? '#b91c1c' : '#b45309',
                      }}
                    >
                      {obs.verificationStatus}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                      {obs.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                    <Clock size={13} />
                    <span>Captured: {new Date(obs.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div>
                  <h3
                    onClick={() => setSelectedObsForDetail(obs)}
                    style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: '0 0 6px', color: '#0f172a', cursor: 'pointer' }}
                  >
                    {obs.title}
                  </h3>
                  <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                    {obs.notes}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} />
                      <span>Observer: <strong>{obs.observerName}</strong> ({obs.observerRole})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} />
                      <span>Coordinates: <strong>[{obs.coordinates[0]?.toFixed(4)}, {obs.coordinates[1]?.toFixed(4)}]</strong></span>
                    </div>
                  </div>
                </div>

                {/* Evidence Viewer */}
                <div style={{ borderTop: '1px dashed rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    LINKED FIELD EVIDENCE
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

                {/* Action Controls & Escalation Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* View on Map */}
                    <button
                      onClick={() => navigate(`/portal/map?lat=${obs.coordinates[0]}&lon=${obs.coordinates[1]}`)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#0284c7',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <MapPin size={13} /> View on Map
                    </button>

                    {/* Escalate to Investigation */}
                    <button
                      onClick={() =>
                        navigate(
                          `/portal/investigations?obsId=${obs.id}&title=${encodeURIComponent(
                            obs.title
                          )}&lat=${obs.coordinates[0]}&lon=${obs.coordinates[1]}&category=${
                            obs.category
                          }&openCreate=true`
                        )
                      }
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fde68a',
                        backgroundColor: '#fffbeb',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#b45309',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ShieldAlert size={13} /> Escalate to Investigation
                    </button>

                    {/* Inspect Details */}
                    <button
                      onClick={() => setSelectedObsForDetail(obs)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={13} /> Inspect
                    </button>
                  </div>

                  {/* Verification Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isVerified && (
                      <button
                        onClick={() => handleVerifyObservation(obs.id, 'VERIFIED')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid #bbf7d0',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Check size={14} /> Verify Observation
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => handleVerifyObservation(obs.id, 'REJECTED')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#991b1b',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <X size={14} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Observation Deep-Dive Detail Drawer / Modal */}
      {selectedObsForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  OBSERVATION DOSSIER: {selectedObsForDetail.id}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                  {selectedObsForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedObsForDetail(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Narrative & Location Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Captured: <strong>{new Date(selectedObsForDetail.timestamp).toLocaleString()}</strong> • Category: <strong>{selectedObsForDetail.category}</strong>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                {selectedObsForDetail.notes}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>OBSERVER IDENTITY</span>
                  <strong>{selectedObsForDetail.observerName}</strong> ({selectedObsForDetail.observerRole})
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>GRID COORDINATES</span>
                  <strong>[{selectedObsForDetail.coordinates[0]?.toFixed(4)}, {selectedObsForDetail.coordinates[1]?.toFixed(4)}]</strong>
                </div>
              </div>
            </div>

            {/* Evidence Section */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                ATTACHED DIGITAL EVIDENCE
              </div>
              <EvidenceViewer evidenceList={obsEvidence[selectedObsForDetail.id] || []} />
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    navigate(`/portal/map?lat=${selectedObsForDetail.coordinates[0]}&lon=${selectedObsForDetail.coordinates[1]}`);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #0284c7',
                    backgroundColor: '#f0f9ff',
                    color: '#0284c7',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MapPin size={14} /> View on Map
                </button>

                <button
                  onClick={() => {
                    navigate(
                      `/portal/investigations?obsId=${selectedObsForDetail.id}&title=${encodeURIComponent(
                        selectedObsForDetail.title
                      )}&lat=${selectedObsForDetail.coordinates[0]}&lon=${selectedObsForDetail.coordinates[1]}&category=${
                        selectedObsForDetail.category
                      }&openCreate=true`
                    );
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    backgroundColor: '#fffbeb',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldAlert size={14} /> Escalate to Case
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleVerifyObservation(selectedObsForDetail.id, 'VERIFIED')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✓ Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Section New Observation Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                  Log New Field Observation
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Record on-the-ground sightings, vessel anomalies, or habitat alerts.
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {formFeedback && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem' }}>
                {formFeedback}
              </div>
            )}

            <form onSubmit={handleCreateObservation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Observation Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  OBSERVATION TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unidentified Trawler operating without AIS transponder"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Category & Confidence */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="vessel_sighting">Vessel Sighting</option>
                    <option value="wildlife">Wildlife Entanglement</option>
                    <option value="weather_hazard">Weather Hazard</option>
                    <option value="sst">SST Thermal Anomaly</option>
                    <option value="chlorophyll">Chlorophyll Bloom</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    OBSERVER CONFIDENCE ({Math.round(formData.confidence * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '8px' }}
                  />
                </div>
              </div>

              {/* Location Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    LATITUDE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="9.2800"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    LONGITUDE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="79.3100"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Narrative Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  DETAILED NARRATIVE & SIGHTING DETAILS
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe vessel appearance, estimated speed, heading, activities observed, or environmental condition..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Direct Evidence File Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  ATTACH DIGITAL EVIDENCE (PHOTO / RADAR CAPTURE)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    style={{ fontSize: '0.82rem', color: '#64748b' }}
                  />
                  {selectedFile && (
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileCheck size={14} /> Ready to upload
                    </span>
                  )}
                </div>
              </div>

              {/* Observer Context Card */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                Submitting Observer: <strong>{user?.name || 'Control Room Operator'}</strong> • Role: <strong>{user?.role || 'CONTROL_ROOM'}</strong>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
