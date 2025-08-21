import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import React, { ReactNode } from 'react';

// ProtectedRoute supports two usage patterns:
// 1) As a route element that renders nested <Route/>s (it returns <Outlet />)
// 2) As a wrapper component used like <ProtectedRoute><MainLayout/></ProtectedRoute>
// The component below supports both by accepting optional children.
export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If children provided, render them. Otherwise fall back to Outlet for nested routes.
  return <>{children ?? <Outlet />}</>;
}
