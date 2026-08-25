import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface ReportItem {
  id: string;
  title: string;
  type: 'INCIDENTS' | 'FIELD' | 'TIPS' | 'PFZ';
  date: string;
  recordCount: number;
  summary: string;
  status: 'GENERATED' | 'LIVE_UPDATED';
  rawPayload: any[];
}

export const PortalReportsPage: React.FC = () => {
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchLiveReports = async () => {
    setIsGenerating(true);
    try {
      const [incRes, obsRes, tipsRes, intelRes] = await Promise.allSettled([
        api.get('/incidents'),
        api.get('/observations'),
        api.get('/tips/control-room'),
        api.get('/intelligence/lookup?lat=9.28&lng=79.31'),
      ]);

      const incData = incRes.status === 'fulfilled' ? (Array.isArray(incRes.value) ? incRes.value : incRes.value.data || []) : [];
      const obsData = obsRes.status === 'fulfilled' ? (Array.isArray(obsRes.value) ? obsRes.value : obsRes.value.data || []) : [];
      const tipsData = tipsRes.status === 'fulfilled' ? (Array.isArray(tipsRes.value) ? tipsRes.value : tipsRes.value.data || []) : [];
      const intelData = intelRes.status === 'fulfilled' ? intelRes.value : {};

      const today = new Date().toISOString().split('T')[0];

      const compiledReports: ReportItem[] = [
        {
          id: `REP-INC-${Date.now().toString().slice(-4)}`,
          title: 'Daily Maritime Incidents & Risk Audit Digest',
          type: 'INCIDENTS',
          date: today,
          recordCount: incData.length,
          summary: `Compiled ${incData.length} live incident records from MongoDB Atlas. Covers vessel anomalies, sanctuary breaches, and critical priority alerts.`,
          status: 'LIVE_UPDATED',
          rawPayload: incData,
        },
        {
          id: `REP-OBS-${Date.now().toString().slice(-4)}`,
          title: 'Coastal Field Officer Observations Log',
          type: 'FIELD',
          date: today,
          recordCount: obsData.length,
          summary: `Ingested ${obsData.length} geotagged field observations submitted by frontline marine rangers and checkpost officers.`,
          status: 'LIVE_UPDATED',
          rawPayload: obsData,
        },
        {
          id: `REP-TIP-${Date.now().toString().slice(-4)}`,
          title: 'Pseudonymous Tipster Verification Registry',
          type: 'TIPS',
          date: today,
          recordCount: tipsData.length,
          summary: `Aggregated ${tipsData.length} confidential tips verified by the 4-Factor Genuineness Engine and Distraction Risk algorithms.`,
          status: 'LIVE_UPDATED',
          rawPayload: tipsData,
        },
        {
          id: `REP-PFZ-${Date.now().toString().slice(-4)}`,
          title: 'INCOIS ERDDAP Potential Fishing Zone Digest',
          type: 'PFZ',
          date: today,
          recordCount: intelData.pfz ? intelData.pfz.length : 1,
          summary: `Satellite Sea Surface Temperature (SST) and Chlorophyll-a front advisories for the Gulf of Mannar EEZ sector.`,
          status: 'LIVE_UPDATED',
          rawPayload: [intelData],
        },
      ];

      setReports(compiledReports);
    } catch (err) {
      console.warn('Failed to compile live reports:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchLiveReports();
  }, []);

  // 1. JSON Export Handler
  const handleExportJSON = (report: ReportItem) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          reportId: report.id,
          title: report.title,
          generatedAt: new Date().toISOString(),
          recordCount: report.recordCount,
          data: report.rawPayload,
        },
        null,
        2
      )
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${report.id}_${report.type.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice(`Successfully exported "${report.title}" as JSON file.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // 2. CSV Export Handler
  const handleExportCSV = (report: ReportItem) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (!report.rawPayload || report.rawPayload.length === 0) {
      csvContent += 'id,title,type,date\n';
      csvContent += `${report.id},"${report.title}",${report.type},${report.date}\n`;
    } else {
      const keys = Object.keys(report.rawPayload[0]).filter(
        (k) => typeof report.rawPayload[0][k] !== 'object'
      );
      csvContent += keys.join(',') + '\n';
      report.rawPayload.forEach((row) => {
        const line = keys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',');
        csvContent += line + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `${report.id}_${report.type.toLowerCase()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice(`Successfully downloaded CSV spreadsheet for "${report.title}".`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // 3. Print / PDF Handler
  const handlePrintPDF = (report: ReportItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.title} - MARIS Official Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; margin: 30px; color: #111; }
            h1 { font-size: 20px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .meta { font-size: 12px; color: #555; margin-bottom: 20px; }
            .summary { background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background: #f1f5f9; font-weight: 600; }
            .header-banner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .badge { background: #166534; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <span class="badge">MARIS OFFICIAL GOVT DEPLOYMENT</span>
              <h1>${report.title}</h1>
            </div>
            <div style="text-align: right; font-size: 11px; color: #666;">
              <strong>MARIS Command Center</strong><br/>
              Gulf of Mannar Sector<br/>
              Date: ${report.date}
            </div>
          </div>

          <div class="meta">
            <strong>Report ID:</strong> ${report.id} &bull; <strong>Type:</strong> ${report.type} &bull; <strong>Records Count:</strong> ${report.recordCount} &bull; <strong>Security Classification:</strong> RESTRICTED
          </div>

          <div class="summary">
            <strong>Operational Summary:</strong><br/>
            ${report.summary}
          </div>

          <h3>Ingested Live Dataset (Top Records)</h3>
          <table>
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Title / Description</th>
                <th>Priority / Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                report.rawPayload.length === 0
                  ? '<tr><td colspan="4">No live records found in dataset.</td></tr>'
                  : report.rawPayload
                      .slice(0, 10)
                      .map(
                        (item) => `
                <tr>
                  <td>${item._id || item.id || item.tipsterId || 'REC-LIVE'}</td>
                  <td>${item.title || item.description || item.zoneName || 'Operational Event Record'}</td>
                  <td>${item.priority || item.genuinenessScore || item.confidence || 'NORMAL'}</td>
                  <td>${item.status || item.verificationState || 'INGESTED'}</td>
                </tr>
              `
                      )
                      .join('')
              }
            </tbody>
          </table>

          <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 10px; color: #888;">
            Generated dynamically by MARIS Agentic Platform &bull; Smart India Hackathon 2026 Problem Statement 26176
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    setExportNotice(`Printable PDF generator opened for "${report.title}".`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const filteredReports = reports.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.type === filterType;
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
            <FileText size={16} color="#000" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              DYNAMIC INTELLIGENCE REPORT GENERATOR
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            Operational Reports & Export Summaries
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)' }}>
            Export live MongoDB incident collections, officer observations, tipster verification logs, and INCOIS PFZ bulletins.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchLiveReports}
            disabled={isGenerating}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.12)',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Recompiling...' : 'Refresh Live Reports'}</span>
          </button>
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

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { label: 'All Reports', value: 'ALL' },
          { label: 'Maritime Incidents', value: 'INCIDENTS' },
          { label: 'Field Observations', value: 'FIELD' },
          { label: 'Tipster Verification', value: 'TIPS' },
          { label: 'INCOIS PFZ Bulletins', value: 'PFZ' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: filterType === tab.value ? '1px solid #000' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: filterType === tab.value ? '#000000' : '#ffffff',
              color: filterType === tab.value ? '#ffffff' : '#000000',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredReports.length === 0 ? (
          <div style={{ padding: '30px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            No reports found for category "{filterType}". Click <strong>Refresh Live Reports</strong> above.
          </div>
        ) : (
          filteredReports.map((rep) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>
                    {rep.id} • {rep.date}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                    {rep.recordCount} Live Records
                  </span>
                </div>

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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleExportJSON(rep)}
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
                  onClick={() => handleExportCSV(rep)}
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
                  onClick={() => handlePrintPDF(rep)}
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
          ))
        )}
      </div>
    </div>
  );
};
