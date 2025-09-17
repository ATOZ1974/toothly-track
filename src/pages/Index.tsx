import { useAuth } from '@/contexts/AuthContext';
import { DentalManagement } from '@/components/dental/DentalManagement';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <div className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              <span className="text-sm sm:text-base font-medium">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full sm:w-auto glass-button"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <DentalManagement />
    </div>
  );
};

export default Index;
