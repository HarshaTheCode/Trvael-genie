import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthCheckProps {
  children: (isAuthenticated: boolean) => ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children(isAuthenticated)}</>;
}
