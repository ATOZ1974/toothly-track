import { useAuth } from '@/contexts/AuthContext';
import { RevenueDashboard } from '@/components/analytics/RevenueDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <div className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <RevenueDashboard />
    </div>
  );
};

export default Analytics;
