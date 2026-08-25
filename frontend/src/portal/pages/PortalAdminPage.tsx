import React, { useState, useEffect } from 'react';
import { Settings, Users, UserPlus, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Lock, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PortalAdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        organization: newOrg,
        badgeNumber: newBadge || `MARIS-${Date.now().toString().slice(-4)}`,
      };

      await api.post('/users', payload);
      setSuccessMessage(`Successfully created user ${newName} with role ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('password123');
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

      {/* User Directory Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, color: '#000' }}>
              Operational User Directory ({usersList.length})
            </h3>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              padding: '6px 14px',
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
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Directory</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>User Details</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Assigned Role</th>
                <th style={{ padding: '12px 16px' }}>Agency / Organization</th>
                <th style={{ padding: '12px 16px' }}>Account Status</th>
                <th style={{ padding: '12px 16px' }}>Role Management</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => {
                const isCurrent = u.email === currentUser?.email;

                return (
                  <tr key={u._id || u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#000' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>Badge: {u.badgeNumber || 'N/A'}</div>
                    </td>

                    <td style={{ padding: '16px', color: 'rgba(0,0,0,0.8)' }}>
                      {u.email}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: u.role === 'ADMIN' || u.role === 'ORG_ADMIN' ? '#fef3c7' : '#eff6ff',
                          color: u.role === 'ADMIN' || u.role === 'ORG_ADMIN' ? '#b45309' : '#1d4ed8',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td style={{ padding: '16px', fontSize: '0.82rem', color: 'rgba(0,0,0,0.6)' }}>
                      {u.organization || 'MARIS Command Center'}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleToggleStatus(u._id || u.id, !u.isActive)}
                        disabled={isCurrent}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: u.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          backgroundColor: u.isActive ? '#f0fdf4' : '#fef2f2',
                          color: u.isActive ? '#166534' : '#991b1b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: isCurrent ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {u.isActive ? '● ACTIVE' : '○ INACTIVE'}
                      </button>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id || u.id, e.target.value, u.isActive)}
                        disabled={isCurrent}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          outline: 'none',
                          cursor: isCurrent ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="CONTROL_ROOM">CONTROL_ROOM</option>
                        <option value="RESEARCHER">RESEARCHER</option>
                        <option value="COASTAL_OFFICER">COASTAL_OFFICER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
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
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#fff', fontSize: '0.85rem', fontWeight: 600 }}
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
