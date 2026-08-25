import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Send,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  RefreshCw,
  Info,
  ShieldCheck,
  Smartphone,
  Globe,
} from 'lucide-react';
import { api } from '../portal/services/api';

export const PublicTipsterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

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

  const getDeviceMetadata = () => {
    return {
      deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP',
      browser: navigator.userAgent.includes('Chrome')
        ? 'Chrome'
        : navigator.userAgent.includes('Firefox')
        ? 'Firefox'
        : 'Browser',
      os: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    };
  };

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
    } catch (err: any) {
      console.error('Tip submission failed:', err);
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
      setSearchError('No matching tip record found. Please verify your 10-digit Tipster ID (e.g. TIP-8492019482).');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', backgroundColor: '#fafafa', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header Hero Section */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="#2563eb" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                CITIZEN ENFORCEMENT & PUBLIC TIPSTER PORTAL
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 600, margin: 0 }}>
              Report Marine Violations Securely
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: '0.95rem', color: '#4b5563', maxWidth: '650px', lineHeight: 1.5 }}>
              Submit pseudonymous reports regarding illegal fishing, sanctuary breaches, or oil pollution in coastal Indian waters. Your identity remains 100% protected.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('submit')}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                border: activeTab === 'submit' ? '1px solid #000000' : '1px solid rgba(0,0,0,0.1)',
                backgroundColor: activeTab === 'submit' ? '#000000' : '#ffffff',
                color: activeTab === 'submit' ? '#ffffff' : '#374151',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Submit New Tip
            </button>
            <button
              onClick={() => setActiveTab('track')}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                border: activeTab === 'track' ? '1px solid #000000' : '1px solid rgba(0,0,0,0.1)',
                backgroundColor: activeTab === 'track' ? '#000000' : '#ffffff',
                color: activeTab === 'track' ? '#ffffff' : '#374151',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Track Tip Status
            </button>
          </div>
        </div>

        {/* TAB 1: SUBMIT NEW CONFIDENTIAL TIP */}
        {activeTab === 'submit' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '0 0 4px', color: '#000' }}>
                Submit Pseudonymous Tip
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b7280' }}>
                A 10-digit pseudonymous Tipster ID will be generated upon submission for private status tracking.
              </p>
            </div>

            {submitResult ? (
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 700, fontSize: '1.1rem' }}>
                  <CheckCircle2 size={24} />
                  <span>Tip Submitted Successfully</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>YOUR PSEUDONYMOUS TRACKING ID</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#047857', fontFamily: 'monospace', letterSpacing: '0.05em', margin: '4px 0' }}>
                    {submitResult.tipsterId}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                    Save this 10-digit ID to track enforcement progress on the "Track Tip Status" tab.
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#14532d', lineHeight: 1.4 }}>
                  <strong>Multi-Factor Verification:</strong> Calculated Genuineness Score: <strong>{submitResult.genuinenessScore}/100</strong> (Distraction Risk: {submitResult.distractionRisk}). Background system metadata logged securely.
                </div>

                <button
                  onClick={() => setSubmitResult(null)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #059669',
                    backgroundColor: '#ffffff',
                    color: '#047857',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Tip
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTip} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                    VIOLATION CATEGORY
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  >
                    <option value="SUSPICIOUS_VESSEL">Suspicious / Unflagged Vessel Activity</option>
                    <option value="ILLEGAL_FISHING">Illegal Gear / Trawling in Protected Waters</option>
                    <option value="SANCTUARY_BREACH">Marine Sanctuary & Seagrass Geofence Breach</option>
                    <option value="WILDLIFE_TRAFFICKING">Dugong / Sea Turtle Trafficking</option>
                    <option value="POLLUTION">Offshore Oil Slick / Chemical Waste Discharge</option>
                    <option value="OTHER">Other Coastal Enforcement Concern</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                    INCIDENT TITLE / SHORT SUMMARY
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unflagged mechanized trawler operating 1.5 miles off Mandapam coast"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                    DETAILED INCIDENT DESCRIPTION
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe vessel appearance, registration markings, gear types used, estimated time, and observed directions..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                      LATITUDE (e.g. 9.28)
                    </label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                      LONGITUDE (e.g. 79.31)
                    </label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>
                </div>

                {/* System Genuineness Verification Info Box */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <ShieldCheck size={20} color="#2563eb" />
                  <div>
                    <strong>Background Verification Active:</strong> To prevent false distraction reports, client IP address, device fingerprints, and location feasibility are logged automatically for genuineness scoring.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                  <span>{isSubmitting ? 'Submitting & Generating ID...' : 'Submit Confidential Tip'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRACK CONFIDENTIAL TIP PROGRESS */}
        {activeTab === 'track' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '0 0 4px', color: '#000' }}>
                Track Tip Enforcement Status
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b7280' }}>
                Enter your 10-digit pseudonymous Tipster ID (e.g. TIP-8492019482) to view live verification status.
              </p>
            </div>

            <form onSubmit={handleTrackLookup} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                required
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter 10-digit Tipster ID (e.g. TIP-8492019482)..."
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.12)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Track Status</span>
              </button>
            </form>

            {searchError && (
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.88rem', fontWeight: 600 }}>
                {searchError}
              </div>
            )}

            {trackedRecord && (
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                    TIPSTER ID: {trackedRecord.tipsterId}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: trackedRecord.status === 'ACTIONED' ? '#dcfce7' : '#fef3c7',
                      color: trackedRecord.status === 'ACTIONED' ? '#15803d' : '#b45309',
                    }}
                  >
                    STATUS: {trackedRecord.status}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: '0 0 6px', color: '#000' }}>
                    {trackedRecord.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Category: <strong>{trackedRecord.category}</strong> • Submitted: {new Date(trackedRecord.reportedAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <strong>Enforcement Notice:</strong> Control room operators cross-examine tips against live satellite synthetic aperture radar (SAR) and coastal patrol vessel tracking before dispatching physical verification teams.
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
