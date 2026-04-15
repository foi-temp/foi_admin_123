import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAdminStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
