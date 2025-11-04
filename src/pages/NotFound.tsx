import { motion } from 'framer-motion';
import { useLocation } from "react-router-dom";
import { PageTransition } from '@/components/PageTransition';

const NotFound = () => {
  const location = useLocation();

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center relative">
        <motion.div
          className="glass-card rounded-2xl p-8 text-center space-y-6"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <motion.h1
            className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            404
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Oops! Page not found
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 glass-button rounded-lg hover:glass-button transition-all"
            >
              Return to Dental Management
            </a>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
