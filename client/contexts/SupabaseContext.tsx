import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from '../config/supabase';

interface User {
  id: string;
  email: string;
  email_verified: boolean;
  subscription_tier: 'free' | 'pro';
  credits_remaining: number;
  is_admin: boolean;
}

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  verifyToken: (token: string) => Promise<{ success: boolean; user?: User; message: string }>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
          // Get user details from our custom users table
          const { data: userData } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: userData } = await supabaseClient
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userData) {
              setUser(userData);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Check your email for the login link!' };
    } catch (error) {
      return { success: false, message: 'Failed to send login link' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabaseClient.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const verifyToken = async (token: string): Promise<{ success: boolean; user?: User; message: string }> => {
    try {
      // This would typically be handled by your backend API
      // For now, we'll return a placeholder
      return { success: false, message: 'Token verification not implemented on client side' };
    } catch (error) {
      return { success: false, message: 'Failed to verify token' };
    }
  };

  const value: SupabaseContextType = {
    user,
    loading,
    signIn,
    signOut,
    verifyToken,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
