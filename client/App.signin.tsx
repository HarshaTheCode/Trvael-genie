import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Mock AuthContext for preview
const AuthContext = React.createContext({
  isAuthenticated: false,
  // ensure setToken signature accepts a token string to match app usage
  setToken: (token: string) => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  const setToken = (token: string) => {
    setIsAuthenticated(!!token);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

// Mock toast for preview
export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.log('Error:', message),
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<div className="p-8 text-white">Sign Up Page (Coming Soon)</div>} />
            <Route path="/forgot-password" element={<div className="p-8 text-white">Forgot Password Page (Coming Soon)</div>} />
            <Route path="/index" element={<div className="p-8 text-white">Dashboard (Coming Soon)</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;