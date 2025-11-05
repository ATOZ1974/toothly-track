import { motion, useScroll, useTransform } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AnimatedNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Transform values based on scroll
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [8, 20]);
  const navPadding = useTransform(scrollY, [0, 100], ['1rem', '0.75rem']);
  const navShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 0 rgba(0, 0, 0, 0)', '0 10px 30px rgba(0, 0, 0, 0.1)']
  );

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      className="sticky top-0 z-50 glass-nav"
      style={{
        opacity: navOpacity,
        backdropFilter: useTransform(navBlur, (v) => `blur(${v}px)`),
        WebkitBackdropFilter: useTransform(navBlur, (v) => `blur(${v}px)`),
        boxShadow: navShadow,
      }}
    >
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: navPadding, paddingBottom: navPadding }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <motion.div
            className="flex items-center gap-3 text-foreground"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Avatar
                className="w-10 h-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                onClick={() => navigate('/profile')}
              >
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <motion.span
              className="text-sm sm:text-base font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
