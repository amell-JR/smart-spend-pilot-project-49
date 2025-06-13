
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener with retry for connection issues
    const setupAuthListener = async () => {
      try {
        const { data: { subscription } } = await supabase.withRetry(async (client) =>
          client.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          })
        );

        // Check for existing session with retry
        const { data: { session } } = await supabase.withRetry(async (client) =>
          client.auth.getSession()
        );

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        return subscription;
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
        return { unsubscribe: () => { } };
      }
    };

    let subscription: { unsubscribe: () => void } | undefined;

    setupAuthListener().then(sub => {
      subscription = sub;
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.withRetry(async (client) => client.auth.signOut());
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force client-side sign out even if the server request fails
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
