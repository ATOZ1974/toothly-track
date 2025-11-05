import { motion } from 'framer-motion';
import { RevenueDashboard } from '@/components/analytics/RevenueDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';

const Analytics = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* Navigation Header */}
        <motion.div
          className="glass-nav sticky top-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="glass-button"
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
          </div>
        </motion.div>
        
        {/* Main Content */}
        <RevenueDashboard />
      </div>
    </PageTransition>
  );
};

export default Analytics;
