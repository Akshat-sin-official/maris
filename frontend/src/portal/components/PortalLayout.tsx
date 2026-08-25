import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';

const routeTitleMap: Record<string, string> = {
  '/portal/dashboard': 'Situation Control Room',
  '/portal/ai': 'MARIS AI Conversational Reasoning',
  '/portal/map': 'Live Marine Web Map',
  '/portal/intelligence': 'Marine Intelligence & Data Feeds',
  '/portal/pfz': 'PFZ Intelligence & Thermal Fronts',
  '/portal/alerts': 'Marine Alerts & Risk Matrix',
  '/portal/field': 'Field Intelligence & Sync Queue',
  '/portal/investigations': 'Incident & Observation Workspace',
  '/portal/tipster': 'Citizen Tipster Audit Deck',
  '/portal/reports': 'Structured Intelligence Reports',
  '/portal/admin': 'System & Access Administration',
};

const roleRouteMatrix: Record<string, string[]> = {
  CONTROL_ROOM_OPERATOR: [
    '/portal/dashboard',
    '/portal/ai',
    '/portal/map',
    '/portal/intelligence',
    '/portal/pfz',
    '/portal/alerts',
    '/portal/field',
    '/portal/investigations',
    '/portal/tipster',
    '/portal/reports',
  ],
  CONTROL_ROOM: [
    '/portal/dashboard',
    '/portal/ai',
    '/portal/map',
    '/portal/intelligence',
    '/portal/pfz',
    '/portal/alerts',
    '/portal/field',
    '/portal/investigations',
    '/portal/tipster',
    '/portal/reports',
  ],
  RESEARCHER: [
    '/portal/dashboard',
    '/portal/ai',
    '/portal/map',
    '/portal/intelligence',
    '/portal/pfz',
    '/portal/reports',
  ],
  SUPERVISOR: [
    '/portal/dashboard',
    '/portal/ai',
    '/portal/map',
    '/portal/intelligence',
    '/portal/pfz',
    '/portal/reports',
  ],
  COASTAL_OFFICER: [
    '/portal/dashboard',
    '/portal/map',
    '/portal/field',
    '/portal/alerts',
    '/portal/reports',
  ],
  FIELD_OFFICER: [
    '/portal/dashboard',
    '/portal/map',
    '/portal/field',
    '/portal/alerts',
    '/portal/reports',
  ],
  ADMIN: [
    '/portal/dashboard',
    '/portal/ai',
    '/portal/map',
    '/portal/intelligence',
    '/portal/pfz',
    '/portal/alerts',
    '/portal/field',
    '/portal/investigations',
    '/portal/tipster',
    '/portal/reports',
    '/portal/admin',
  ],
  ORG_ADMIN: [
    '/portal/dashboard',
    '/portal/ai',
    '/portal/map',
    '/portal/intelligence',
    '/portal/pfz',
    '/portal/alerts',
    '/portal/field',
    '/portal/investigations',
    '/portal/tipster',
    '/portal/reports',
    '/portal/admin',
  ],
};

export const PortalLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => window.innerWidth < 1200);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [realtimeNotification, setRealtimeNotification] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  // 1. Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/portal/login') {
      navigate('/portal/login');
      return;
    }

    // 2. Strict RBAC Route Enforcement
    if (isAuthenticated && user?.role) {
      const allowedRoutes = roleRouteMatrix[user.role] || roleRouteMatrix.CONTROL_ROOM_OPERATOR;
      const currentPath = location.pathname;

      if (currentPath !== '/portal/login' && !allowedRoutes.includes(currentPath)) {
        console.warn(`[RBAC] Access denied for role '${user.role}' to route '${currentPath}'. Redirecting to /portal/dashboard.`);
        navigate('/portal/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user?.role, location.pathname, navigate]);

  // 3. Connect WebSockets & listen for realtime events globally
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const handleSocketEvent = (eventName: string, data: any) => {
      if (eventName === 'tip:submitted' || eventName === 'tip:created') {
        setRealtimeNotification({
          type: 'TIP',
          title: `🚨 NEW CITIZEN TIP RECEIVED (${data.tipsterId || 'TIP-NEW'})`,
          message: `Category: ${data.category || 'SUSPICIOUS_VESSEL'} • Genuineness Score: ${data.genuinenessScore || 85}/100`,
          link: '/portal/tipster',
        });
      } else if (eventName === 'new_incident') {
        setRealtimeNotification({
          type: 'INCIDENT',
          title: `⚠️ NEW OPERATIONAL INCIDENT (${data.incidentId || 'INC-NEW'})`,
          message: `${data.title || 'Marine Emergency Alert'}`,
          link: '/portal/investigations',
        });
      }
    };

    socketService.connect(token, handleSocketEvent);

    return () => {
      socketService.removeListener(handleSocketEvent);
    };
  }, [isAuthenticated, token]);

  const pageTitle = routeTitleMap[location.pathname] || 'Operational Portal';

  return (
    <div
      style={{
        backgroundColor: '#fbfbfd',
        minHeight: '100vh',
        width: '100%',
        color: '#000000',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
      }}
    >
      <PortalSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <PortalHeader
        sidebarCollapsed={collapsed}
        onOpenMobileSidebar={() => setMobileOpen(true)}
        pageTitle={pageTitle}
      />

      {/* Realtime Notification Toast Banner */}
      {realtimeNotification && (
        <div
          style={{
            position: 'fixed',
            top: '84px',
            right: '32px',
            zIndex: 1100,
            backgroundColor: '#ffffff',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 10px 30px rgba(239,68,68,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '420px',
            animation: 'slideIn 0.3s ease',
          }}
        >
          <ShieldAlert size={24} color="#dc2626" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', marginBottom: '2px' }}>
              {realtimeNotification.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#374151' }}>{realtimeNotification.message}</div>
            <button
              onClick={() => {
                navigate(realtimeNotification.link);
                setRealtimeNotification(null);
              }}
              style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#2563eb',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Open Control Room Workspace →
            </button>
          </div>
          <button
            onClick={() => setRealtimeNotification(null)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <main
        style={{
          marginLeft: collapsed ? '80px' : '260px',
          padding: '28px 32px 48px',
          minHeight: 'calc(100vh - 72px)',
          boxSizing: 'border-box',
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="portal-main-content"
      >
        <Outlet />
      </main>
    </div>
  );
};
