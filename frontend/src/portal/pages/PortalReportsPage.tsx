import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle2 } from 'lucide-react';

export const PortalReportsPage: React.FC = () => {
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'REP-2026-0824',
      title: 'Daily Marine Situation & Hazard Digest',
      type: 'DAILY_SITUATION',
      date: '2026-08-24',
      summary: 'Comprehensive analysis of swell warnings, PFZ advisories, and active vessel anomalies in Gulf of Mannar.',
      status: 'GENERATED',
    },
    {
      id: 'REP-2026-0823',
      title: 'Weekly Conservation Sanctuary Audit',
      type: 'CONSERVATION',
      date: '2026-08-23',
      summary: 'Dugong seagrass habitat monitoring report and geofence compliance metrics.',
      status: 'ARCHIVED',
    },
    {
      id: 'REP-2026-0820',
      title: 'PFZ Harvest Efficiency & SST Correlation',
      type: 'PFZ_HARVEST',
      date: '2026-08-20',
      summary: 'Correlated satellite Chlorophyll-a fronts with landed fish catch volume metrics.',
      status: 'ARCHIVED',
    },
  ];

  const handleExport = (format: string, reportTitle: string) => {
    setExportNotice(`Exporting "${reportTitle}" as ${format.toUpperCase()}... File download initialized.`);
    setTimeout(() => setExportNotice(null), 4000);
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
            <FileText size={16} color="#000" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              STRUCTURED INTELLIGENCE REPORT GENERATOR
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Operational Reports & Export Summaries
          </h2>
        </div>
      </div>

      {exportNotice && (
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
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Reports List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reportsList.map((rep) => (
          <div
            key={rep.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>
                {rep.id} • {rep.date}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>
                {rep.status}
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, color: '#000' }}>
              {rep.title}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.4 }}>
              {rep.summary}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px' }}>
              <button
                onClick={() => handleExport('json', rep.title)}
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
                <Download size={14} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => handleExport('csv', rep.title)}
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
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf', rep.title)}
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
                <Printer size={14} />
                <span>Printable PDF Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
