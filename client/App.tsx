import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import VerifyLogin from '@/pages/VerifyLogin';
import Index from '@/pages/Index';
import SavedPlans from '@/pages/SavedPlans';
import ShareItinerary from '@/pages/ShareItinerary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthCheck from '@/components/auth/AuthCheck';
import NotFound from '@/pages/NotFound';
import { useEffect } from 'react';
import './global.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <AuthCheck>
                    {(isAuthenticated) =>
                      isAuthenticated ? (
                        <Navigate to="/app" replace />
                      ) : (
                        <LandingPage />
                      )
                    }
                  </AuthCheck>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/verify" element={<VerifyLogin />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<Index />} />
                <Route path="/saved-plans" element={<SavedPlans />} />
                <Route path="/share/:shareId" element={<ShareItinerary />} />
              </Route>

              {/* 404 - Keep at the end */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
