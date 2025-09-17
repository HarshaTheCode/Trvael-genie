import "./global.css";
// Removed Toaster, Sonner, and TooltipProvider from shadcn/ui. Use standard HTML elements or remove if not needed.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerShim } from "./components/ui/sonner";
import { Toaster as SonnerToaster } from 'sonner';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import VerifyLogin from "./pages/VerifyLogin";
import SignUp from "./pages/SignUp";
import SavedPlans from "./pages/SavedPlans";
import ShareItinerary from "./pages/ShareItinerary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";
import ViewItinerary from "./pages/ViewItinerary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
  <Toaster />
  {/* Mount the real Sonner Toaster so existing `toast` calls (from 'sonner') display */}
  <SonnerToaster />
  {/* Keep local Sonner shim mounted for preview builds if needed */}
  <SonnerShim />
      <BrowserRouter>
        <Routes>
           <Route path="/" element={<LandingPage />} />

          <Route path="/index" element={<ProtectedRoute><Index /></ProtectedRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/verify" element={<VerifyLogin />} />
          <Route path="/saved-plans" element={<ProtectedRoute><SavedPlans /></ProtectedRoute>} />
          <Route path="/itinerary/:id" element={<ProtectedRoute><ViewItinerary /></ProtectedRoute>} />
          <Route path="/share/:shareId" element={<ShareItinerary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
