import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Plus, RefreshCw, Eye, Edit, Send, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface ResearchReport {
  _id?: string;
  id?: string;
  reportId: string;
  title: string;
  category: 'BIODIVERSITY_ASSESSMENT' | 'PFZ_ADVISORY' | 'SPECIES_MIGRATION' | 'POLLUTION_DRIFT' | 'ILLEGAL_TRAWLING' | 'CLIMATE_IMPACT';
  author: string;
  abstract: string;
  content: string;
  region: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  tags: string[];
  downloadsCount: number;
  publishedAt?: string;
  createdAt: string;
}

export const PortalReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reportsList, setReportsList] = useState<ResearchReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  // Modals State
  const [showAuthorModal, setShowAuthorModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<ResearchReport | null>(null);
  const [editingReport, setEditingReport] = useState<ResearchReport | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Author Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('BIODIVERSITY_ASSESSMENT');
  const [formRegion, setFormRegion] = useState('Gulf of Mannar Sector B4');
  const [formAbstract, setFormAbstract] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<string>('PUBLISHED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      const raw = res.data?.reports || res.data || res;
      const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.reports) ? raw.reports : []);
      setReportsList(data);
    } catch (err) {
      console.warn('Failed to fetch research reports from backend:', err);
      setReportsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const handleModeChange = () => fetchReports();
    window.addEventListener('maris:simulated_mode_changed', handleModeChange);
    return () => window.removeEventListener('maris:simulated_mode_changed', handleModeChange);
  }, []);

  const openCreateModal = () => {
    setEditingReport(null);
    setFormTitle('');
    setFormCategory('BIODIVERSITY_ASSESSMENT');
    setFormRegion('Gulf of Mannar Sector B4');
    setFormAbstract('');
    setFormContent('');
    setFormStatus('PUBLISHED');
    setShowAuthorModal(true);
  };

  const openEditModal = (rep: ResearchReport) => {
    setEditingReport(rep);
    setFormTitle(rep.title);
    setFormCategory(rep.category);
    setFormRegion(rep.region || 'Gulf of Mannar Sector B4');
    setFormAbstract(rep.abstract);
    setFormContent(rep.content);
    setFormStatus(rep.status);
    setShowAuthorModal(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAbstract.trim() || !formContent.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        category: formCategory,
        region: formRegion,
        abstract: formAbstract,
        content: formContent,
        status: formStatus,
        tags: ['Marine Intelligence', 'INCOIS', formCategory],
      };

      if (editingReport) {
        await api.patch(`/reports/${editingReport._id || editingReport.id}`, payload);
        setNotice(`Report ${editingReport.reportId} updated successfully.`);
      } else {
        const res = await api.post('/reports', payload);
        const created = res.data || res;
        setNotice(`Report ${created.reportId || 'NEW'} created and saved to MongoDB Atlas.`);
      }

      setTimeout(() => setNotice(null), 4000);
      setShowAuthorModal(false);
      fetchReports();
    } catch (err: any) {
      console.error('Failed to save research report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishToggle = async (rep: ResearchReport) => {
    const targetStatus = rep.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.patch(`/reports/${rep._id || rep.id}/publish`, { status: targetStatus });
      setNotice(`Report ${rep.reportId} status updated to ${targetStatus}`);
      setTimeout(() => setNotice(null), 3000);
      fetchReports();
    } catch (err) {
      console.error('Failed to toggle report status:', err);
    }
  };

  const isAuthorRole = ['RESEARCHER', 'SUPERVISOR', 'ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'].includes(user?.role || '');

  const filteredReports = (Array.isArray(reportsList) ? reportsList : []).filter((r) => {
    if (activeTab === 'DRAFT') return r.status === 'DRAFT';
    if (activeTab === 'PUBLISHED') return r.status === 'PUBLISHED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Banner */}
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
            <FileText size={18} color="#000" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MARIS MARINE RESEARCH & POLICY INTELLIGENCE
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 500, margin: 0 }}>
            Scientific Publications & Environmental Studies
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'rgba(0,0,0,0.6)', maxWidth: '700px' }}>
            Author, edit, review, and publish oceanographic intelligence reports, species migration studies, and potential fishing zone (PFZ) advisories.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthorRole && (
            <button
              onClick={openCreateModal}
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
              <Plus size={16} />
              <span>Create New Report</span>
            </button>
          )}

          <div style={{ fontSize: '0.8rem', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '9999px', fontWeight: 600 }}>
            Author Role: {user?.role || 'RESEARCHER'}
          </div>
        </div>
      </div>

      {notice && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ALL' ? '#ffffff' : 'transparent',
              fontWeight: activeTab === 'ALL' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'ALL' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            All Reports ({reportsList.length})
          </button>
          <button
            onClick={() => setActiveTab('PUBLISHED')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'PUBLISHED' ? '#ffffff' : 'transparent',
              fontWeight: activeTab === 'PUBLISHED' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'PUBLISHED' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Published ({reportsList.filter((r) => r.status === 'PUBLISHED').length})
          </button>
          <button
            onClick={() => setActiveTab('DRAFT')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DRAFT' ? '#ffffff' : 'transparent',
              fontWeight: activeTab === 'DRAFT' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'DRAFT' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Drafts ({reportsList.filter((r) => r.status === 'DRAFT').length})
          </button>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Registry</span>
        </button>
      </div>

      {/* Reports Directory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredReports.map((rep) => {
          const isPublished = rep.status === 'PUBLISHED';

          return (
            <div
              key={rep._id || rep.id || rep.reportId}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontFamily: 'monospace' }}>
                    {rep.reportId}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: isPublished ? '#f0fdf4' : '#fef3c7', color: isPublished ? '#166534' : '#b45309' }}>
                    {rep.status}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 8px', color: '#000' }}>
                  {rep.title}
                </h3>

                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px', display: 'flex', gap: '12px' }}>
                  <span>Author: <strong>{rep.author}</strong></span>
                  <span>Region: <strong>{rep.region}</strong></span>
                </div>

                <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rep.abstract}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setShowViewModal(rep)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} />
                  <span>Read Report</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {isAuthorRole && (
                    <>
                      <button
                        onClick={() => openEditModal(rep)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handlePublishToggle(rep)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: isPublished ? '1px solid #fecaca' : '1px solid #bbf7d0',
                          backgroundColor: isPublished ? '#fef2f2' : '#f0fdf4',
                          color: isPublished ? '#991b1b' : '#166534',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* READ REPORT MODAL */}
      {showViewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowViewModal(null)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '750px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                {showViewModal.reportId} • {showViewModal.category}
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: '10px 0 6px' }}>{showViewModal.title}</h2>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Authored by <strong>{showViewModal.author}</strong> • {new Date(showViewModal.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0284c7', marginBottom: '20px' }}>
              <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0369a1', display: 'block', marginBottom: '4px' }}>EXECUTIVE ABSTRACT</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>{showViewModal.abstract}</p>
            </div>

            <div style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#1e293b', whiteSpace: 'pre-line' }}>
              {showViewModal.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
              <button onClick={() => setShowViewModal(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT AUTHOR REPORT MODAL */}
      {showAuthorModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAuthorModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '680px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '0 0 16px', color: '#000' }}>
              {editingReport ? `Edit Research Report: ${editingReport.reportId}` : 'Author New Research Report'}
            </h3>

            <form onSubmit={handleSaveReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>REPORT TITLE</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Coral Reef Thermal Stress Analysis in Gulf of Mannar Sector"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>RESEARCH CATEGORY</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.88rem' }}
                  >
                    <option value="BIODIVERSITY_ASSESSMENT">BIODIVERSITY_ASSESSMENT</option>
                    <option value="PFZ_ADVISORY">PFZ_ADVISORY</option>
                    <option value="SPECIES_MIGRATION">SPECIES_MIGRATION</option>
                    <option value="POLLUTION_DRIFT">POLLUTION_DRIFT</option>
                    <option value="ILLEGAL_TRAWLING">ILLEGAL_TRAWLING</option>
                    <option value="CLIMATE_IMPACT">CLIMATE_IMPACT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>TARGET REGION</label>
                  <input
                    type="text"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>EXECUTIVE ABSTRACT</label>
                <textarea
                  required
                  rows={2}
                  value={formAbstract}
                  onChange={(e) => setFormAbstract(e.target.value)}
                  placeholder="Summary of scientific findings and operational recommendations..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>FULL NARRATIVE CONTENT</label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Detailed research methodology, satellite observations, and data correlation..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>STATUS:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem' }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowAuthorModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    {isSubmitting ? 'Saving...' : 'Save & Publish'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
