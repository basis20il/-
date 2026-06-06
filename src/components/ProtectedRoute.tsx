import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactElement; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-amber-800">טוען...</div>;
  }
  if (!session) return <Navigate to="/login" replace />;
  if (adminOnly && !profile?.is_admin) return <Navigate to="/" replace />;
  return children;
};
