import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { useAuth } from '../context/AuthContext';

const routeTitleMap: Record<string, string> = {
  '/portal/dashboard': 'Situation Control Room',
  '/portal/ai': 'MARIS AI Conversational Reasoning',
  '/portal/map': 'Live Marine Web Map',
  '/portal/intelligence': 'Marine Intelligence & Data Feeds',
  '/portal/pfz': 'PFZ Intelligence & Thermal Fronts',
  '/portal/alerts': 'Marine Alerts & Risk Matrix',
  '/portal/field': 'Field Intelligence & Sync Queue',
  '/portal/investigations': 'Incident & Observation Workspace',
  '/portal/reports': 'Structured Intelligence Reports',
  '/portal/admin': 'System & Access Administration',
};

export const PortalLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => window.innerWidth < 1200);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to login if user is not authenticated and trying to access portal routes (except login)
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/portal/login') {
      navigate('/portal/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

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
