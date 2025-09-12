import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { DentalManagement } from '@/components/dental/DentalManagement';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dental-50 to-dental-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🦷</div>
          <div className="text-xl text-dental-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dental-50 to-dental-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🦷</div>
          <h1 className="text-3xl font-bold text-dental-800 mb-4">Sweet Tooth Dental</h1>
          <p className="text-dental-600 mb-6">Professional dental practice management system</p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Sign In to Access Your Practice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-semibold text-dental-800">
            Welcome, {user.user_metadata?.full_name || user.email}
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
      <DentalManagement />
    </div>
  );
};

export default Index;
