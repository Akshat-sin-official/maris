import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

// Public Website Pages
import { HomePage } from './pages/HomePage';
import { ProblemPage } from './pages/ProblemPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { AgentsPage } from './pages/AgentsPage';
import { MarineDataPage } from './pages/MarineDataPage';
import { FieldIntelligencePage } from './pages/FieldIntelligencePage';
import { UseCasesPage } from './pages/UseCasesPage';
import { TechnologyPage } from './pages/TechnologyPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Operational Portal Pages & Context
import { AuthProvider } from './portal/context/AuthContext';
import { PortalLayout } from './portal/components/PortalLayout';
import { PortalLoginPage } from './portal/pages/PortalLoginPage';
import { PortalDashboardPage } from './portal/pages/PortalDashboardPage';
import { PortalMarisAiPage } from './portal/pages/PortalMarisAiPage';
import { PortalLiveMapPage } from './portal/pages/PortalLiveMapPage';
import { PortalMarineDataPage } from './portal/pages/PortalMarineDataPage';
import { PortalPfzPage } from './portal/pages/PortalPfzPage';
import { PortalAlertsPage } from './portal/pages/PortalAlertsPage';
import { PortalFieldPage } from './portal/pages/PortalFieldPage';
import { PortalInvestigationsPage } from './portal/pages/PortalInvestigationsPage';
import { PortalReportsPage } from './portal/pages/PortalReportsPage';
import { PortalAdminPage } from './portal/pages/PortalAdminPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* OPERATIONAL PORTAL ROUTES (Mounted under /portal/*) */}
        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<PortalDashboardPage />} />
          <Route path="ai" element={<PortalMarisAiPage />} />
          <Route path="map" element={<PortalLiveMapPage />} />
          <Route path="intelligence" element={<PortalMarineDataPage />} />
          <Route path="pfz" element={<PortalPfzPage />} />
          <Route path="alerts" element={<PortalAlertsPage />} />
          <Route path="field" element={<PortalFieldPage />} />
          <Route path="investigations" element={<PortalInvestigationsPage />} />
          <Route path="reports" element={<PortalReportsPage />} />
          <Route path="admin" element={<PortalAdminPage />} />
        </Route>

        {/* PUBLIC INNOVATION WEBSITE ROUTES */}
        <Route
          path="/*"
          element={
            <div style={{ backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
              <ScrollToTop />
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/problem" element={<ProblemPage />} />
                <Route path="/intelligence" element={<IntelligencePage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/marine-data" element={<MarineDataPage />} />
                <Route path="/field-intelligence" element={<FieldIntelligencePage />} />
                <Route path="/use-cases" element={<UseCasesPage />} />
                <Route path="/technology" element={<TechnologyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Footer />
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
