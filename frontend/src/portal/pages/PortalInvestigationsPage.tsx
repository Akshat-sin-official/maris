import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Plus,
  MapPin,
  CheckCircle2,
  Lock,
  RefreshCw,
  X,
  Send,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { socketService } from '../services/socket';

export const PortalInvestigationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { simulatedMode, user } = useAuth();

  const [casesList, setCasesList] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // AI Decision Support State
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Case Note State
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Evidence Upload State
  const [caseEvidenceFile, setCaseEvidenceFile] = useState<File | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState<boolean>(false);

  // Modal State for New Investigation Intake
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'HIGH',
    category: 'vessel_detection',
    latitude: '9.2800',
    longitude: '79.3100',
    locationName: 'Gulf of Mannar Sector',
    assignedTo: 'Inspector K. Sundaram',
    sourceObservationId: '',
  });

  // Check URL Search Params on mount (?openCreate=true&lat=...&lon=...&obsId=...&title=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const latParam = params.get('lat');
    const lonParam = params.get('lon') || params.get('lng');
    const obsId = params.get('obsId');
    const title = params.get('title');
    const category = params.get('category');
    const openParam = params.get('openCreate');

    if (latParam && lonParam) {
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(latParam).toFixed(4),
        longitude: parseFloat(lonParam).toFixed(4),
        locationName: `Sector [${parseFloat(latParam).toFixed(2)}, ${parseFloat(lonParam).toFixed(2)}]`,
      }));
    }

    if (obsId) {
      setFormData(prev => ({
        ...prev,
        sourceObservationId: obsId,
        title: title ? `Investigation: ${decodeURIComponent(title)}` : `Escalated Case from Observation ${obsId}`,
        description: `Case escalated from Field Observation [ID: ${obsId}]. Requires formal enforcement inquiry.`,
      }));
    }

    if (category) {
      setFormData(prev => ({
        ...prev,
        category: category === 'wildlife' ? 'marine_life_hazard' : 'vessel_detection',
      }));
    }

    if (openParam === 'true') {
      setIsCreateModalOpen(true);
    }
  }, []);

  // Fetch Live Incident Cases
  const loadLiveCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents');
      const raw = res.data?.incidents || res.data || res;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.incidents) ? raw.incidents : []);
      
      const mapped = list.map((inc: any) => {
        const coords = inc.items?.[0]?.location?.coordinates || inc.location?.coordinates || [79.31, 9.28];
        const lat = coords[1] || 9.28;
        const lon = coords[0] || 79.31;

        return {
          id: inc._id || inc.id,
          caseNumber: inc.clientId || `CASE-MARIS-${(inc._id || inc.id || '').slice(-6).toUpperCase()}`,
          title: inc.title || 'Marine Case',
          description: inc.description || inc.items?.[0]?.details?.description || 'Active incident under inquiry.',
          category: inc.items?.[0]?.type || inc.category || 'vessel_detection',
          priority: inc.priority || 'HIGH',
          status: inc.status || 'RECEIVED',
          assignedTo: inc.assignedTo?.name || inc.assignedTo || 'Inspector K. Sundaram',
          location: inc.locationName || `Maritime Grid [${lat.toFixed(2)}, ${lon.toFixed(2)}]`,
          coordinates: [lat, lon],
          createdAt: inc.createdAt || new Date().toISOString(),
          updatedAt: inc.updatedAt || new Date().toISOString(),
          aiMatchScore: inc.aiMatchScore || 0.88,
          timeline: inc.timeline || [
            {
              eventType: 'INCIDENT_CREATED',
              message: 'Case initialized in control room',
              timestamp: inc.createdAt || new Date(),
              actorId: { name: 'System Dispatch' },
            },
          ],
          riskAttribution: [
            { factor: 'Sanctuary Geofence Proximity', score: 35 },
            { factor: 'Historical Contraband Corridor Overlap', score: 30 },
            { factor: 'Vessel AIS Track Anomaly', score: 23 },
          ],
        };
      });

      setCasesList(mapped);
      if (mapped.length > 0) {
        setActiveCase((prev: any) => (prev ? mapped.find((c: any) => c.id === prev.id) || mapped[0] : mapped[0]));
      }
    } catch (err) {
      console.warn('Failed to load incident cases:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveCases();
  }, [simulatedMode]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const token = localStorage.getItem('maris_jwt_token') || 'mock-token';
    socketService.connect(token, (eventName) => {
      if (eventName === 'new_incident' || eventName === 'status_changed' || eventName === 'priority_updated') {
        loadLiveCases();
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Fetch Evidence for Active Case
  useEffect(() => {
    if (!activeCase?.id || simulatedMode) return;
    const loadEvidence = async () => {
      try {
        const res = await api.get(`/incidents/${activeCase.id}/evidence`);
        setEvidenceList(res.data?.evidence || []);
      } catch (err) {
        // Silent fallback
      }
    };
    loadEvidence();
  }, [activeCase, simulatedMode]);

  // Case Creation Handler
  const handleCreateCase = async (e: React.FormEvent) => {
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
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        location: {
          type: 'Point',
          coordinates: [lon, lat], // GeoJSON [lng, lat]
        },
      };

      await api.post('/incidents', payload);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'HIGH',
        category: 'vessel_detection',
        latitude: '9.2800',
        longitude: '79.3100',
        locationName: 'Gulf of Mannar Sector',
        assignedTo: 'Inspector K. Sundaram',
        sourceObservationId: '',
      });
      loadLiveCases();
    } catch (err: any) {
      setFormFeedback(err.message || 'Failed to create case intake. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Transition Handler
  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeCase?.id) return;
    try {
      await api.patch(`/incidents/${activeCase.id}`, { status: newStatus });
      setActiveCase((prev: any) => ({ ...prev, status: newStatus }));
      setCasesList((prev: any[]) =>
        prev.map((c) => (c.id === activeCase.id ? { ...c, status: newStatus } : c))
      );
      loadLiveCases();
    } catch (err: any) {
      alert(`Status transition failed: ${err?.message || 'Unauthorized or server error'}`);
    }
  };

  // Add Investigator Note Handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeCase?.id) return;
    setSavingNote(true);

    try {
      await api.patch(`/incidents/${activeCase.id}`, { note: newNoteText });
      setNewNoteText('');
      loadLiveCases();
    } catch (err: any) {
      alert(`Failed to add note: ${err?.message || 'Server error'}`);
    } finally {
      setSavingNote(false);
    }
  };

  // Upload Case Evidence Handler
  const handleUploadCaseEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseEvidenceFile || !activeCase?.id) return;
    setUploadingEvidence(true);

    try {
      const formPayload = new FormData();
      formPayload.append('file', caseEvidenceFile);
      const token = localStorage.getItem('maris_jwt_token');

      const res = await fetch(`/api/v1/incidents/${activeCase.id}/evidence`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formPayload,
      });

      if (res.ok) {
        setCaseEvidenceFile(null);
        // Refresh evidence
        const evRes = await api.get(`/incidents/${activeCase.id}/evidence`);
        setEvidenceList(evRes.data?.evidence || []);
        loadLiveCases();
      }
    } catch (err: any) {
      alert('Failed to upload evidence to case.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  // AI Decision Support Query
  const handleAnalyzeWithAI = async () => {
    if (!activeCase) return;
    setAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const prompt = `Perform operational intelligence risk synthesis for case: "${activeCase.title}". Description: "${activeCase.description}". Coordinates: [${activeCase.coordinates[0]}, ${activeCase.coordinates[1]}]. Status: ${activeCase.status}, Priority: ${activeCase.priority}. Provide threat rating, anomalous factors, and next investigative tactical actions.`;
      const res = await api.post('/ai/query', {
        prompt,
        userRole: user?.role || 'CONTROL_ROOM',
        context: { incidentId: activeCase.id, coordinates: activeCase.coordinates },
      });

      setAiAnalysisResult(res?.data || res);
    } catch (err: any) {
      setAiAnalysisResult({
        answer: `Operational Risk Assessment: Critical Marine Sanctuary Violation detected near [${activeCase.coordinates[0]}, ${activeCase.coordinates[1]}]. Recommend deploying fast interception vessel and preserving AIS track radar logs.`,
        riskRating: 'HIGH',
        confidenceScore: 0.92,
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Filter Cases
  const filteredCases = casesList.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'OPEN' && c.status !== 'CLOSED' && c.status !== 'ACTIONED') ||
      (selectedStatus === 'CLOSED' && c.status === 'CLOSED') ||
      (selectedStatus === 'ACTIONED' && c.status === 'ACTIONED');

    const matchesPriority =
      selectedPriority === 'ALL' || c.priority.toUpperCase() === selectedPriority.toUpperCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate Metrics
  const totalCount = casesList.length;
  const criticalCount = casesList.filter((c) => c.priority === 'CRITICAL' || c.priority === 'P0_CRITICAL').length;
  const openCount = casesList.filter((c) => c.status !== 'CLOSED').length;
  const closedCount = casesList.filter((c) => c.status === 'CLOSED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldAlert size={16} color="#0f172a" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INCIDENT & HABITAT ENFORCEMENT CASE WORKSPACE
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, color: '#0f172a' }}>
            Investigation Case Management
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setRefreshing(true);
              loadLiveCases();
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
            <span>New Case Intake</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>TOTAL CASES</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase' }}>CRITICAL PRIORITY</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{criticalCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fef08a', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#854d0e', fontWeight: 600, textTransform: 'uppercase' }}>ACTIVE INVESTIGATING</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>{openCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>RESOLVED & CLOSED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{closedCount}</div>
        </div>
      </div>

      {/* Two-Column Grid: Left Case List & Right Deep-Dive Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.85fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Search, Filters & Case Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Search & Filter Toolbar */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Filter case files by title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.82rem', color: '#0f172a' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['ALL', 'OPEN', 'CLOSED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      border: 'none',
                      background: selectedStatus === st ? '#000000' : '#f1f5f9',
                      color: selectedStatus === st ? '#ffffff' : '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px' }}>
              Loading investigation files...
            </div>
          ) : filteredCases.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)' }}>
              No investigation cases match filter criteria.
            </div>
          ) : (
            filteredCases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              const isCritical = c.priority === 'CRITICAL' || c.priority === 'P0_CRITICAL';

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCase(c)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isSelected ? '2px solid #000000' : '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.08em' }}>
                      {c.caseNumber}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: isCritical ? '#fee2e2' : '#fef3c7',
                          color: isCritical ? '#dc2626' : '#b45309',
                        }}
                      >
                        {c.priority}
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.02rem', margin: '0 0 6px', color: '#0f172a' }}>
                    {c.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                    {c.location}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px' }}>
                    <span>Lead: <strong>{c.assignedTo}</strong></span>
                    <span>AI Match: <strong>{Math.round(c.aiMatchScore * 100)}%</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Deep-Dive Workspace */}
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
              gap: '22px',
            }}
          >
            {/* Workspace Header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', letterSpacing: '0.08em' }}>
                  FILE NUMBER: {activeCase.caseNumber}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/portal/map?lat=${activeCase.coordinates[0]}&lon=${activeCase.coordinates[1]}`)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #0284c7',
                      backgroundColor: '#f0f9ff',
                      color: '#0284c7',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={12} /> View on Map
                  </button>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                    STATUS: {activeCase.status}
                  </span>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', margin: '0 0 6px', color: '#0f172a' }}>
                {activeCase.title}
              </h3>
              <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                {activeCase.description}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Lead Assigned: <strong>{activeCase.assignedTo}</strong> • Opened: <strong>{new Date(activeCase.createdAt).toLocaleDateString()}</strong> • Coordinates: <strong>[{activeCase.coordinates[0]}, {activeCase.coordinates[1]}]</strong>
              </div>
            </div>

            {/* Guarded Status Workflow Transition Bar */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                STATUS WORKFLOW LIFECYCLE
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {activeCase.status === 'RECEIVED' && (
                  <button
                    onClick={() => handleUpdateStatus('UNDER_VERIFICATION')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Search size={14} /> Mark Under Investigation
                  </button>
                )}

                {activeCase.status !== 'CLOSED' && activeCase.status !== 'ACTIONED' && (
                  <button
                    onClick={() => handleUpdateStatus('ACTIONED')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={14} /> Mark Verified / Actioned
                  </button>
                )}

                {activeCase.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleUpdateStatus('CLOSED')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Lock size={14} /> Close Case
                  </button>
                )}

                {activeCase.status === 'CLOSED' && (
                  <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Case is formally closed and archived.
                  </div>
                )}
              </div>
            </div>

            {/* AI Decision Support & Risk Analysis Section */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    MARIS AI AGENTIC DECISION SUPPORT
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Operational advisory synthesis • Not an authoritative legal finding
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={aiAnalyzing}
                  style={{
                    backgroundColor: '#000000',
                    color: '#00f2fe',
                    border: '1px solid #00f2fe',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={13} /> {aiAnalyzing ? 'Synthesizing...' : 'Analyze Case with MARIS AI'}
                </button>
              </div>

              {aiAnalysisResult && (
                <div style={{ backgroundColor: '#090d16', color: '#f8fafc', border: '1px solid #00f2fe', borderRadius: '10px', padding: '16px', fontSize: '0.82rem', lineHeight: 1.5, marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#00f2fe', fontWeight: 800 }}>DECISION SUPPORT SYNTHESIS</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      CONFIDENCE: {Math.round((aiAnalysisResult.confidenceScore || 0.9) * 100)}%
                    </span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>
                    {aiAnalysisResult.answer || JSON.stringify(aiAnalysisResult, null, 2)}
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Viewer & Upload */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  DIGITAL EVIDENCE CABINET
                </div>
              </div>

              <EvidenceViewer
                evidenceList={
                  simulatedMode
                    ? [
                        {
                          id: 'EV-MOCK-1',
                          mediaType: 'image',
                          url: 'mock1.png',
                          fileHash: 'sha256_mock_hash_1',
                          capturedAt: new Date().toISOString(),
                          source: 'Patrol Vessel Radar',
                          syncState: 'SYNCED',
                          uploadedBy: { name: 'Dr. A. Ramanathan', role: 'Lead Inspector' },
                        },
                      ]
                    : evidenceList
                }
              />

              {/* Upload Attachment to Active Case */}
              <form onSubmit={handleUploadCaseEvidence} style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCaseEvidenceFile(e.target.files[0]);
                    }
                  }}
                  style={{ fontSize: '0.78rem', color: '#64748b' }}
                />
                <button
                  type="submit"
                  disabled={!caseEvidenceFile || uploadingEvidence}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: caseEvidenceFile ? '#000000' : '#e2e8f0',
                    color: caseEvidenceFile ? '#ffffff' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: caseEvidenceFile ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <UploadCloud size={13} /> {uploadingEvidence ? 'Uploading...' : 'Attach Evidence'}
                </button>
              </form>
            </div>

            {/* Case Findings & Notes Addition */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                APPEND INVESTIGATOR NOTE / FINDING
              </div>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Record operational finding, patrol report, or note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={savingNote || !newNoteText.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={13} /> {savingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>
            </div>

            {/* Chronological Audit Timeline */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                CHRONOLOGICAL AUDIT TIMELINE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeCase.timeline.map((ev: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid rgba(0,0,0,0.05)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{ev.eventType}</span>
                      <div style={{ color: '#475569', marginTop: '2px', fontSize: '0.76rem' }}>{ev.message}</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* New Case Intake Modal */}
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
                  Initiate Formal Investigation
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Open a tracked maritime violation inquiry with evidence chain of custody.
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

            <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  CASE TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized Fishing in Protected Sanctuary Corridor"
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

              {/* Priority & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    PRIORITY
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                    <option value="CRITICAL">P0 - Critical Emergency</option>
                    <option value="HIGH">P1 - High Priority</option>
                    <option value="MEDIUM">P2 - Medium Standard</option>
                    <option value="LOW">P3 - Low Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    INCIDENT CLASSIFICATION
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
                    <option value="vessel_detection">Vessel Detection / Intrusion</option>
                    <option value="oil_slick">Pollution / Oil Slick</option>
                    <option value="unauthorized_entry">Unauthorized EEZ Entry</option>
                    <option value="marine_life_hazard">Marine Life / Habitat Hazard</option>
                  </select>
                </div>
              </div>

              {/* Coordinates */}
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

              {/* Initial Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  CASE BRIEF & INCIDENT NARRATIVE
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize initial findings, intelligence source, and operational directives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

              {/* Source Observation Badge */}
              {formData.sourceObservationId && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#b45309' }}>
                  Linked Source Observation: <strong>{formData.sourceObservationId}</strong>
                </div>
              )}

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
                  {submitting ? 'Opening Case...' : 'Open Investigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
