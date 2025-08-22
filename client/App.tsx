import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FullPageErrorFallback } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import './global.css';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const VerifyLogin = lazy(() => import('@/pages/VerifyLogin'));
const Index = lazy(() => import('@/pages/Index'));
const SavedPlans = lazy(() => import('@/pages/SavedPlans'));
const ShareItinerary = lazy(() => import('@/pages/ShareItinerary'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy load auth components
const ProtectedRoute = lazy(() => import('@/components/auth/ProtectedRoute'));
const AuthCheck = lazy(() => import('@/components/auth/AuthCheck'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AuthCheck>
                {(isAuthenticated) =>
                  isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />
                }
              </AuthCheck>
            </Suspense>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<LoadingSpinner />}><SignUp /></Suspense>} />
        <Route path="/auth/verify" element={<Suspense fallback={<LoadingSpinner />}><VerifyLogin /></Suspense>} />

        {/* Protected routes */}
        <Route
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            </Suspense>
          }
        >
          <Route path="/app" element={<Suspense fallback={<LoadingSpinner />}><Index /></Suspense>} />
          <Route path="/saved-plans" element={<Suspense fallback={<LoadingSpinner />}><SavedPlans /></Suspense>} />
          <Route path="/share/:shareId" element={<Suspense fallback={<LoadingSpinner />}><ShareItinerary /></Suspense>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
