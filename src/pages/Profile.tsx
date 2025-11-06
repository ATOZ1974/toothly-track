import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountCentre } from '@/components/profile/AccountCentre';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTransition } from '@/components/PageTransition';
import { FadeInOnScroll } from '@/components/FadeInOnScroll';
import { AnimatedCard } from '@/components/AnimatedCard';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* Navigation Header */}
        <motion.div
          className="glass-nav sticky top-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm"
                onClick={() => navigate('/')}
              >
                <motion.div
                  whileHover={{ x: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="inline-block"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                </motion.div>
                Back to Dashboard
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <AnimatedCard delay={0} className="p-6 sm:p-8" hover={false}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="text-center sm:text-left flex-1">
                  <motion.h1
                    className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {user?.user_metadata?.full_name || 'User'}
                  </motion.h1>
                  <motion.p
                    className="text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {user?.email}
                  </motion.p>
                </div>
              </div>
            </AnimatedCard>

            {/* Quick Actions */}
            <FadeInOnScroll delay={0.1}>
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/analytics')}
                    className="glass-button h-auto py-6 flex-col gap-2 w-full"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <BarChart3 className="w-6 h-6" />
                    </motion.div>
                    <span className="font-medium">Analytics</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                    className="glass-button h-auto py-6 flex-col gap-2 w-full"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <LogOut className="w-6 h-6" />
                    </motion.div>
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </motion.div>
              </div>
            </FadeInOnScroll>

            {/* Account Centre */}
            <FadeInOnScroll delay={0.2}>
              <AccountCentre />
            </FadeInOnScroll>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
