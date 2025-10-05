import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            practice_name: practiceName
          }
        }
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email for the confirmation link!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="glass-card w-full max-w-md mx-4 sm:mx-auto rounded-2xl animate-scale-in relative z-10">
        <div className="text-center space-y-2 p-6 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🦷 Dental Patient Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sign in to manage your dental practice
          </p>
        </div>
        <div className="p-4 sm:p-6 pt-0">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card">
              <TabsTrigger value="signin" className="glass-button">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="glass-button">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="animate-fade-in">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="glass-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="glass-card" />
                </div>
                <Button type="submit" className="w-full glass-button" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="animate-fade-in">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required className="glass-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input id="hospitalName" type="text" placeholder="Enter your hospital name" value={practiceName} onChange={e => setPracticeName(e.target.value)} className="glass-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input id="signupEmail" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="glass-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input id="signupPassword" type="password" placeholder="Create a password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="glass-card" />
                </div>
                <Button type="submit" className="w-full glass-button" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
}