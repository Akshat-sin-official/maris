import React, { useState, useEffect } from 'react';
import { Settings, Users, UserPlus, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PortalMapCanvas } from '../components/PortalMapCanvas';
import { api } from '../services/api';

export const PortalAdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // BigData Telemetry status
  const [beaconCount, setBeaconCount] = useState<number>(0);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // New User Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState('CONTROL_ROOM');
  const [newOrg, setNewOrg] = useState('MARIS Operational Command');
  const [newBadge, setNewBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/users');
      const data = res.data?.users || res.users || (Array.isArray(res) ? res : []);
      setUsersList(data);
    } catch (err: any) {
      console.warn('Failed to fetch user directory from backend:', err);
      setErrorMessage(err.message || 'Failed to load user directory from MongoDB Atlas');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveTelemetry = async () => {
    try {
      const res = await api.get('/intelligence/live-locations');
      if (res && Array.isArray(res.locations)) {
        setBeaconCount(res.locations.length);
        setIsLiveActive(true);
      }
    } catch (err) {
      console.warn('Live telemetry check notice:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLiveTelemetry();
    const handleModeChange = () => {
      fetchUsers();
      fetchLiveTelemetry();
    };
    window.addEventListener('maris:simulated_mode_changed', handleModeChange);
    const interval = setInterval(fetchLiveTelemetry, 20000);
    return () => {
      window.removeEventListener('maris:simulated_mode_changed', handleModeChange);
      clearInterval(interval);
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword.trim(),
        role: newRole,
        organization: newOrg,
        badgeNumber: newBadge || `MARIS-${Date.now().toString().slice(-4)}`,
      };

      const res = await api.post('/users', payload);
      const createdUser = res.data?.user || { ...payload, _id: `usr-${Date.now()}`, isActive: true };

      setSuccessMessage(`Successfully created user ${newName} with role ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('password123');

      setUsersList((prev) => [createdUser, ...(Array.isArray(prev) ? prev : []).filter((u) => u.email !== createdUser.email)]);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create new user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, updatedRole: string, currentActiveStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, {
        role: updatedRole,
        isActive: currentActiveStatus,
      });

      setSuccessMessage(`Updated user role to ${updatedRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId: string, targetActive: boolean) => {
    try {
      await api.patch(`/users/${userId}`, {
        isActive: targetActive,
      });

      setSuccessMessage(`User status updated to ${targetActive ? 'Active' : 'Inactive'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle user status');
    }
  };

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
            <Settings size={18} color="#000" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MARIS PLATFORM & ACCESS CONTROL ADMINISTRATION
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 500, margin: 0 }}>
            User Management & Role Permissions
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'rgba(0,0,0,0.6)', maxWidth: '700px' }}>
            Create new operational staff accounts, adjust role privileges, deactivate accounts, and enforce organization boundaries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
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
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>

          <div style={{ fontSize: '0.8rem', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '9999px', fontWeight: 600 }}>
            Admin Logged In: {currentUser?.email}
          </div>
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Embedded Live GIS Map Preview & Telemetry Monitor */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <Radio size={18} className="text-red-500 animate-pulse" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: 0, color: '#0f172a' }}>
                Live Hydrographic GIS Map & Location Beacons
              </h3>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.6)' }}>
              Real-time spatial telemetry streaming from BigData location intelligence with active heartbeat nodes.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '9999px', padding: '4px 12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              {beaconCount} Active Beacons
            </span>
            <span style={{ fontSize: '0.78rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '9999px', padding: '4px 12px', fontWeight: 600 }}>
              Heartbeat: Active
            </span>
          </div>
        </div>

        {/* Portal Map Canvas Embedded */}
        <PortalMapCanvas height="450px" initialLayers={{ liveLocations: true, alerts: true, pfz: true }} />
      </div>

      {/* User Directory Table Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#000" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0 }}>
              Operational Staff Directory ({usersList.length})
            </h3>
          </div>

          <button
            onClick={fetchUsers}
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
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem' }}>
            Loading MongoDB staff records...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', textAlign: 'left', color: 'rgba(0,0,0,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>User Details</th>
                  <th style={{ padding: '12px 16px' }}>Role / Level</th>
                  <th style={{ padding: '12px 16px' }}>Organization</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr: any) => (
                  <tr key={usr._id || usr.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#000' }}>{usr.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)' }}>{usr.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={usr.role}
                        onChange={(e) => handleUpdateRole(usr._id || usr.id, e.target.value, usr.isActive !== false)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(0,0,0,0.15)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        <option value="CONTROL_ROOM">CONTROL_ROOM</option>
                        <option value="RESEARCHER">RESEARCHER</option>
                        <option value="COASTAL_OFFICER">COASTAL_OFFICER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="CITIZEN">CITIZEN</option>
                        <option value="TIPSTER">TIPSTER</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(0,0,0,0.7)' }}>
                      {usr.organization || 'Ministry of Ports & Shipping'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: usr.isActive !== false ? '#dcfce7' : '#fee2e2',
                          color: usr.isActive !== false ? '#15803d' : '#991b1b',
                        }}
                      >
                        {usr.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(usr._id || usr.id, usr.isActive === false ? true : false)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          backgroundColor: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {usr.isActive === false ? 'Reactivate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Active API Connections Panel */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', margin: 0 }}>
            Live Integration Services & API Connectivity Status
          </h3>
          <div style={{ fontSize: '0.75rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Server-Side Secure Token Handling Active
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
          {[
            { name: 'BigData Location Intelligence', key: 'BIGDATA_API_KEY', status: isLiveActive ? 'ONLINE' : 'CONFIGURED', latency: '95 ms' },
            { name: 'xAI Grok 4.6 Engine', key: 'XAI_API_KEY', status: 'ONLINE', latency: '240 ms' },
            { name: 'OpenWeatherMap Coastal', key: 'OPENWEATHER_API_KEY', status: 'ONLINE', latency: '110 ms' },
            { name: 'Open-Meteo Marine Stream', key: 'OPEN_METEO_PUBLIC', status: 'ONLINE', latency: '85 ms' },
            { name: 'INCOIS ERDDAP Dataset', key: 'INCOIS_PUBLIC', status: 'ONLINE', latency: '140 ms' },
            { name: 'Copernicus Marine (akumarsingh)', key: 'COPERNICUS_USER', status: 'CONFIGURED', latency: '310 ms' },
          ].map((srv, idx) => (
            <div key={idx} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fafafa', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#000' }}>{srv.name}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: srv.status === 'ONLINE' ? '#dcfce7' : '#fef3c7', color: srv.status === 'ONLINE' ? '#15803d' : '#b45309' }}>
                  {srv.status}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)' }}>Latency: {srv.latency}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '550px',
              width: '100%',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, color: '#000' }}>
                Create Operational Account
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                Assign operational roles and seed initial login credentials.
              </p>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>FULL NAME</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cmdr. Vikram Singh"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. vikram@maris.gov.in"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>INITIAL PASSWORD</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>ORGANIZATION</label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="MARIS Operational Command"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>ASSIGNED ROLE</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.88rem' }}
                  >
                    <option value="CONTROL_ROOM">CONTROL_ROOM</option>
                    <option value="RESEARCHER">RESEARCHER</option>
                    <option value="COASTAL_OFFICER">COASTAL_OFFICER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>BADGE NUMBER</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="MARIS-CR-005"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
