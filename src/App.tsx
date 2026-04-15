import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AdminLayout } from './components/layout/AdminLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MatrimonyPage } from './pages/matrimony/MatrimonyPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { PrayersPage } from './pages/prayers/PrayersPage';
import { EventsPage } from './pages/events/EventsPage';
import { VolunteersPage } from './pages/volunteers/VolunteersPage';
import { UsersPage } from './pages/users/UsersPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#11819A',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        components: {
          Button: {
            controlHeight: 40,
            paddingContentHorizontal: 20,
            borderRadius: 8,
          },
          Table: {
            headerBg: '#F9FAFB',
            headerColor: '#4B5563',
          },
          Card: {
            paddingLG: 24,
          }
        }
      }}
    >
      <HashRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="matrimony" element={<MatrimonyPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="prayers" element={<PrayersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="volunteers" element={<VolunteersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
