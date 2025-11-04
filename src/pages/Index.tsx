import { DentalManagement } from '@/components/dental/DentalManagement';
import { AnimatedNav } from '@/components/AnimatedNav';
import { PageTransition } from '@/components/PageTransition';

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <AnimatedNav />
        <DentalManagement />
      </div>
    </PageTransition>
  );
};

export default Index;
