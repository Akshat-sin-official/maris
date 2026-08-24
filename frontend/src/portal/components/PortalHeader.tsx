import React, { useState } from 'react';
import { Menu, Shield, ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PortalHeaderProps {
  sidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
  pageTitle: string;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  sidebarCollapsed,
  onOpenMobileSidebar,
  pageTitle,
}) => {
  const { user, switchRole, logout, simulatedMode, toggleSimulatedMode } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const rolesList: UserRole[] = ['Control Room Operator', 'Researcher', 'Coastal Officer', 'Admin'];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 980,
        height: '72px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: sidebarCollapsed ? '80px' : '260px',
        transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="portal-header"
    >
      {/* Left Area: Mobile Menu Trigger + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar menu"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
          className="portal-mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: '#000000',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {pageTitle}
          </h1>
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-body)',
              color: 'rgba(0,0,0,0.45)',
            }}
          >
            Region: {user?.activeRegion || 'Gulf of Mannar EEZ'}
          </span>
        </div>
      </div>

      {/* Right Area: Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Ask MARIS Quick Search Trigger */}
        <button
          onClick={() => navigate('/portal/ai')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '9999px',
            border: '1px solid rgba(0,0,0,0.12)',
            backgroundColor: 'rgba(0,0,0,0.03)',
            color: '#000000',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={14} color="#fa2edf" />
          <span>Ask MARIS AI</span>
          <kbd
            style={{
              fontSize: '0.65rem',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Backend Connection Status Pill */}
        <button
          onClick={toggleSimulatedMode}
          title="Click to toggle simulated offline preview vs live API contract"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            border: simulatedMode ? '1px solid #cbd5e1' : '1px solid #bbf7d0',
            backgroundColor: simulatedMode ? '#f8fafc' : '#f0fdf4',
            color: simulatedMode ? '#475569' : '#166534',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: simulatedMode ? '#94a3b8' : '#22c55e',
              display: 'inline-block',
            }}
          />
          <span>{simulatedMode ? 'Simulated Baseline' : 'Live API Connected'}</span>
        </button>

        {/* Role Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              color: '#000000',
            }}
          >
            <Shield size={14} color="rgba(0,0,0,0.6)" />
            <span>{user?.role}</span>
            <ChevronDown size={14} />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '200px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                padding: '6px',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'rgba(0,0,0,0.4)',
                  padding: '6px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                SWITCH OPERATIONAL ROLE
              </div>
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: user?.role === r ? 'rgba(0,0,0,0.05)' : 'transparent',
                    color: user?.role === r ? '#000000' : 'rgba(0,0,0,0.7)',
                    fontWeight: user?.role === r ? 600 : 400,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{r}</span>
                  {user?.role === r && (
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#000' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.avatar || 'M'}
          </button>

          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                padding: '12px',
                zIndex: 1000,
              }}
            >
              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000000' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>{user?.email}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', marginTop: '4px' }}>
                  {user?.organization}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                  navigate('/portal/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
