import { useAuth } from '@/contexts/AuthContext';
import { DentalManagement } from '@/components/dental/DentalManagement';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <div className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 text-foreground">
              <Avatar 
                className="w-10 h-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                onClick={() => navigate('/profile')}
              >
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm sm:text-base font-medium">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')}
              className="glass-button"
              size="sm"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
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
