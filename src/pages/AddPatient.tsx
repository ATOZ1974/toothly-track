import { DentalManagement } from '@/components/dental/DentalManagement';
import { AnimatedNav } from '@/components/AnimatedNav';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AddPatient = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <AnimatedNav />
        
        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 py-4">
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
              Back to Home
            </Button>
          </motion.div>
        </div>

        <DentalManagement />
      </div>
    </PageTransition>
  );
};

export default AddPatient;
