import React, { useState, useEffect } from 'react';
import { Eye, Film, Trash2, Calendar, MapPin, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface EvidenceItem {
  id: string;
  _id?: string;
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  fileHash: string;
  capturedAt: string;
  location?: {
    coordinates: [number, number];
  };
  source: string;
  syncState: string;
  uploadedBy?: {
    name: string;
    role: string;
  };
}

interface EvidenceViewerProps {
  evidenceList: EvidenceItem[];
  onDelete?: (id: string) => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ evidenceList, onDelete }) => {
  const { simulatedMode } = useAuth();
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingSigned, setLoadingSigned] = useState<Record<string, boolean>>({});

  // Resolve signed URLs for items when requested or on mount
  useEffect(() => {
    if (simulatedMode) return;

    evidenceList.forEach(async (item) => {
      const id = item.id || item._id;
      if (!id || signedUrls[id] || loadingSigned[id]) return;

      setLoadingSigned((prev) => ({ ...prev, [id]: true }));
      try {
        const res = await api.get(`/evidence/${id}/access`);
        if (res.url) {
          setSignedUrls((prev) => ({ ...prev, [id]: res.url }));
        }
      } catch (err) {
        console.error(`Failed to load access URL for evidence ${id}:`, err);
      } finally {
        setLoadingSigned((prev) => ({ ...prev, [id]: false }));
      }
    });
  }, [evidenceList, simulatedMode]);

  const getDisplayUrl = (item: EvidenceItem): string => {
    const id = item.id || item._id;
    if (simulatedMode) {
      // Mock thumbnail sources
      return item.mediaType === 'video'
        ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80';
    }
    return signedUrls[id || ''] || '';
  };

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px dashed rgba(0,0,0,0.12)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'rgba(0,0,0,0.4)',
        fontSize: '0.82rem'
      }}>
        No evidence files linked to this case file.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
        {evidenceList.map((item) => {
          const id = item.id || item._id || '';
          const isVideo = item.mediaType === 'video';
          const thumbnail = getDisplayUrl(item);

          return (
            <div
              key={id}
              onClick={() => setSelectedItem(item)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                backgroundColor: '#090d16',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Media Preview Thumbnail */}
              <img
                src={thumbnail || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=150&q=80'}
                alt="evidence thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: thumbnail ? 0.8 : 0.3 }}
              />

              {/* Overlays */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(9, 13, 22, 0.4)',
                color: '#fff',
              }}>
                {isVideo ? <Film size={22} style={{ color: '#00f2fe' }} /> : <Eye size={18} />}
              </div>

              {/* Delete Icon Gated by Auth */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Confirm deletion of this evidence file from record?')) {
                      onDelete(id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.95)',
                    border: 'none',
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    zIndex: 2,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}

              {/* Sync Tag */}
              <span style={{
                position: 'absolute',
                bottom: '6px',
                left: '6px',
                fontSize: '0.62rem',
                backgroundColor: item.syncState === 'SYNCED' ? '#22c55e' : '#eab308',
                color: '#fff',
                padding: '2px 5px',
                borderRadius: '3px',
                fontWeight: 700
              }}>
                {item.syncState || 'PENDING'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expanded Modal Workspace */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(9,13,22,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }} onClick={() => setSelectedItem(null)}>
          <div style={{
            backgroundColor: '#090d16',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            color: '#fff',
            overflow: 'hidden',
            fontFamily: 'monospace',
            boxShadow: '0 10px 40px rgba(0,242,254,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Left Col: Full Preview */}
            <div style={{
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '4/3',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {selectedItem.mediaType === 'video' ? (
                <video
                  src={getDisplayUrl(selectedItem)}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={getDisplayUrl(selectedItem)}
                  alt="evidence preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* Right Col: Metadata Inspector */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid rgba(0,242,254,0.15)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#00f2fe' }}>EVIDENCE METADATA</span>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ opacity: 0.5 }}>EVIDENCE ID</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedItem.id || selectedItem._id}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} className="text-cyan-400" />
                  <div>
                    <span style={{ opacity: 0.5, display: 'block' }}>CAPTURE TIME</span>
                    <span>{selectedItem.capturedAt ? new Date(selectedItem.capturedAt).toLocaleString() : 'Capture time unavailable'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} className="text-cyan-400" />
                  <div>
                    <span style={{ opacity: 0.5, display: 'block' }}>CAPTURE LOCATION</span>
                    <span>
                      {selectedItem.location?.coordinates
                        ? `LAT: ${selectedItem.location.coordinates[1]} • LNG: ${selectedItem.location.coordinates[0]}`
                        : 'Location unavailable'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={14} className="text-cyan-400" />
                  <div>
                    <span style={{ opacity: 0.5, display: 'block' }}>UPLOADER / CONTEXT</span>
                    <span>
                      {selectedItem.uploadedBy?.name || 'Field Officer'} ({selectedItem.uploadedBy?.role || 'Field Context'})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                  <div>
                    <span style={{ opacity: 0.5 }}>SOURCE</span>
                    <div style={{ fontWeight: 700 }}>{selectedItem.source || 'Mobile Client'}</div>
                  </div>
                  <div>
                    <span style={{ opacity: 0.5 }}>FILE TYPE</span>
                    <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedItem.mediaType}</div>
                  </div>
                </div>

                {/* SHA-256 integrity check */}
                {selectedItem.fileHash && (
                  <div style={{ background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.1)', borderRadius: '6px', padding: '8px', fontSize: '0.68rem', marginTop: '6px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px', color: '#00f2fe' }}>SHA-256 CHECKHASH</div>
                    <span style={{ wordBreak: 'break-all', opacity: 0.8 }}>{selectedItem.fileHash}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
