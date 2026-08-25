import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Compass,
  Activity,
  Fish,
  AlertTriangle,
  Radio,
  ShieldAlert,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';

interface PortalSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  allowedRoles?: UserRole[];
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/portal/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'MARIS Grok AI',
      path: '/portal/ai',
      icon: Bot,
      badge: 'Agentic',
      allowedRoles: ['Control Room Operator', 'Researcher', 'Coastal Officer', 'Admin'],
    },
    {
      name: 'Live GIS Map',
      path: '/portal/map',
      icon: Compass,
      allowedRoles: ['Control Room Operator', 'Coastal Officer', 'Admin'],
    },
    {
      name: 'Marine Data & Feeds',
      path: '/portal/intelligence',
      icon: Activity,
      allowedRoles: ['Control Room Operator', 'Researcher', 'Admin'],
    },
    {
      name: 'PFZ Advisories',
      path: '/portal/pfz',
      icon: Fish,
      badge: 'INCOIS',
      allowedRoles: ['Control Room Operator', 'Researcher', 'Admin'],
    },
    {
      name: 'Alerts & Hazards',
      path: '/portal/alerts',
      icon: AlertTriangle,
      badge: 'Live',
      allowedRoles: ['Control Room Operator', 'Coastal Officer', 'Admin'],
    },
    {
      name: 'Field Observations',
      path: '/portal/field',
      icon: Radio,
      allowedRoles: ['Control Room Operator', 'Coastal Officer', 'Admin'],
    },
    {
      name: 'Investigations',
      path: '/portal/investigations',
      icon: ShieldAlert,
      allowedRoles: ['Control Room Operator', 'Admin'],
    },
    {
      name: 'Tipster Portal',
      path: '/portal/tipster',
      icon: Lock,
      badge: 'Private',
      allowedRoles: ['Control Room Operator', 'Coastal Officer', 'Admin'],
    },
    {
      name: 'Research Reports',
      path: '/portal/reports',
      icon: FileText,
      allowedRoles: ['Control Room Operator', 'Researcher', 'Admin'],
    },
    {
      name: 'Administration',
      path: '/portal/admin',
      icon: Settings,
      allowedRoles: ['Control Room Operator', 'Admin'],
    },
  ];

  const roleAliasMap: Record<string, string[]> = {
    'Control Room Operator': ['Control Room Operator', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM', 'Admin', 'ORG_ADMIN'],
    'CONTROL_ROOM_OPERATOR': ['Control Room Operator', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM', 'Admin', 'ORG_ADMIN'],
    'CONTROL_ROOM': ['Control Room Operator', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM', 'Admin', 'ORG_ADMIN'],
    'Researcher': ['Researcher', 'RESEARCHER', 'SUPERVISOR', 'Admin', 'ORG_ADMIN'],
    'RESEARCHER': ['Researcher', 'RESEARCHER', 'SUPERVISOR', 'Admin', 'ORG_ADMIN'],
    'SUPERVISOR': ['Researcher', 'RESEARCHER', 'SUPERVISOR', 'Admin', 'ORG_ADMIN'],
    'Coastal Officer': ['Coastal Officer', 'COASTAL_OFFICER', 'FIELD_OFFICER', 'Admin', 'ORG_ADMIN'],
    'COASTAL_OFFICER': ['Coastal Officer', 'COASTAL_OFFICER', 'FIELD_OFFICER', 'Admin', 'ORG_ADMIN'],
    'FIELD_OFFICER': ['Coastal Officer', 'COASTAL_OFFICER', 'FIELD_OFFICER', 'Admin', 'ORG_ADMIN'],
    'Admin': ['Control Room Operator', 'Researcher', 'Coastal Officer', 'Admin', 'ORG_ADMIN', 'ADMIN'],
    'ADMIN': ['Control Room Operator', 'Researcher', 'Coastal Officer', 'Admin', 'ORG_ADMIN', 'ADMIN'],
    'ORG_ADMIN': ['Control Room Operator', 'Researcher', 'Coastal Officer', 'Admin', 'ORG_ADMIN', 'ADMIN'],
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    const currentRole = user?.role || 'Control Room Operator';
    const aliases = roleAliasMap[currentRole] || [currentRole];
    return item.allowedRoles.some((allowed) => aliases.includes(allowed));
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 990,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: collapsed ? '80px' : '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          zIndex: 995,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          boxShadow: mobileOpen ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
        }}
        className={mobileOpen ? 'portal-sidebar-mobile-open' : ''}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '72px',
            padding: collapsed ? '0 16px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              M
            </div>
            {!collapsed && (
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#000000',
                    letterSpacing: '0.02em',
                  }}
                >
                  .maris
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.4)',
                    display: 'block',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  OPERATIONAL PORTAL
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar collapse"
            style={{
              display: collapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.6)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <div
          style={{
            flex: 1,
            padding: '16px 12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {!collapsed && (
            <div
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                color: 'rgba(0,0,0,0.35)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '8px 12px 4px',
              }}
            >
              MODULES
            </div>
          )}

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isRestricted = item.allowedRoles && user && !item.allowedRoles.includes(user.role);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: isActive ? '#000000' : 'rgba(0, 0, 0, 0.65)',
                  backgroundColor: isActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                  fontWeight: isActive ? 600 : 450,
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  opacity: isRestricted ? 0.45 : 1,
                  pointerEvents: isRestricted ? 'none' : 'auto',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} strokeWidth={1.75} />
                  {!collapsed && <span>{item.name}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: item.badge.includes('Critical') ? '#fee2e2' : '#f1f5f9',
                      color: item.badge.includes('Critical') ? '#dc2626' : '#475569',
                      border: item.badge.includes('Critical') ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {!collapsed && isRestricted && <Lock size={12} color="rgba(0,0,0,0.4)" />}
              </NavLink>
            );
          })}
        </div>

        {/* Footer: Public Web Link & Collapse trigger when collapsed */}
        <div
          style={{
            padding: '16px 12px',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.08)',
                backgroundColor: '#fdfdfd',
                color: 'rgba(0,0,0,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              <span>Back to Public Website</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </aside>
    </>
  );
};
