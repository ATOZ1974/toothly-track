import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PageTransition } from '@/components/PageTransition';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100),
  practiceName: z.string().trim().max(100).optional(),
});
export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Check if user is already authenticated and clear stale tokens
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          // Clear stale session data on error
          await supabase.auth.signOut({ scope: 'local' });
        } else if (session) {
          navigate('/');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        await supabase.auth.signOut({ scope: 'local' });
      }
    };
    checkAuth();
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate input
      const validationResult = signUpSchema.safeParse({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        practiceName: practiceName.trim() || undefined,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      // Clear any stale auth data before signing up
      await supabase.auth.signOut({ scope: 'local' });

      const { data, error } = await supabase.auth.signUp({
        email: validationResult.data.email,
        password: validationResult.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validationResult.data.fullName,
            practice_name: validationResult.data.practiceName || null,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
      } else if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else {
          toast.success('Account created! Check your email to confirm your account.');
          // Clear form
          setEmail('');
          setPassword('');
          setFullName('');
          setPracticeName('');
        }
      }
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast.error(error.message || 'An unexpected error occurred');
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
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <motion.div
          className="glass-card w-full max-w-md mx-4 sm:mx-auto rounded-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className="text-center space-y-2 p-6 pb-4">
            <motion.h1
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              🦷 Dental Patient Management
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Sign in to manage your dental practice
            </motion.p>
          </div>
          <motion.div
            className="p-4 sm:p-6 pt-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-card">
                <TabsTrigger value="signin" className="glass-button">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="glass-button">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <motion.form
                  onSubmit={handleSignIn}
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="glass-card" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="glass-card" />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full glass-button" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </motion.div>
                </motion.form>
              </TabsContent>
              
              <TabsContent value="signup">
                <motion.form
                  onSubmit={handleSignUp}
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full glass-button" disabled={loading}>
                      {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </motion.div>
                </motion.form>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}