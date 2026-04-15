import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAdminStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-3xl">F</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Foi Admin</h2>
          <p className="mt-2 text-sm text-slate-500">
            Faith-based application management portal
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
