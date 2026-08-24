import React from 'react';
import { Settings, Users, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PortalAdminPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
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
            <Settings size={16} color="#000" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              CONTROL ROOM SYSTEM & ACCESS ADMINISTRATION
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0 }}>
            System Settings & Security Controls
          </h2>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '9999px', fontWeight: 600 }}>
          Role Level: {user?.role}
        </div>
      </div>

      {/* Grid: Role Matrix & Provider Config */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Monitoring Region Coordinates Configuration */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#000" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: 0 }}>
              Primary Monitoring Bounding Box
            </h3>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.4 }}>
            Geographic bounding box for automated Copernicus/IMD data polling and spatial indexing.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ padding: '10px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.68rem', fontWeight: 700 }}>MIN LAT / LNG</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>8.00° N, 77.50° E</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.68rem', fontWeight: 700 }}>MAX LAT / LNG</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>13.50° N, 81.00° E</div>
            </div>
          </div>
        </div>

        {/* User Role Access Matrix */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#000" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: 0 }}>
              Role-Based Access Control (RBAC)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            {[
              { role: 'Control Room Operator', access: 'Full Situation Control, Dispatches & AI Query' },
              { role: 'Researcher', access: 'Analytics, Data Export & PFZ Studies' },
              { role: 'Coastal Officer', access: 'Field Verification & Sync Management' },
              { role: 'Admin', access: 'System Settings, Provider Adapters & Users' },
            ].map((r, idx) => (
              <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#000' }}>{r.role}</span>
                <span style={{ color: 'rgba(0,0,0,0.5)' }}>{r.access}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
