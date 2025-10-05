import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed, clear local session
          setTimeout(() => {
            supabase.auth.signOut({ scope: 'local' });
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          // Ensure local storage is cleared
          setTimeout(() => {
            supabase.auth.signOut({ scope: 'local' });
          }, 0);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session with error handling
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (error) {
          // Clear any stale tokens on error
          console.error('Session error:', error);
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          // Proactively clear any stale tokens to avoid refresh errors
          if (!session) {
            await supabase.auth.signOut({ scope: 'local' });
          }
        }
        setLoading(false);
      })
      .catch(async (err) => {
        console.error('Failed to get session:', err);
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Try global sign out first; fallback to local if session is missing
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signOut({ scope: 'local' });
      setSession(null);
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      if (
        error.message?.toLowerCase().includes('session') ||
        error.message?.toLowerCase().includes('refresh')
      ) {
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}