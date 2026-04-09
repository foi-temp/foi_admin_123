import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MatrimonyPage } from './pages/matrimony/MatrimonyPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { PrayersPage } from './pages/prayers/PrayersPage';
import { EncouragementsPage } from './pages/encouragements/EncouragementsPage';
import { EventsPage } from './pages/events/EventsPage';
import { VolunteersPage } from './pages/volunteers/VolunteersPage';
import { UsersPage } from './pages/users/UsersPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

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
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="matrimony" element={<MatrimonyPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="prayers" element={<PrayersPage />} />
            <Route path="encouragements" element={<EncouragementsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
