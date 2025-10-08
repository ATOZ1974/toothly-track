import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, BarChart3, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountCentre } from '@/components/profile/AccountCentre';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const { user, signOut } = useAuth();
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
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {user?.user_metadata?.full_name || 'User'}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/analytics')}
              className="glass-button h-auto py-6 flex-col gap-2"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="font-medium">Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="glass-button h-auto py-6 flex-col gap-2"
            >
              <LogOut className="w-6 h-6" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>

          {/* Account Centre */}
          <AccountCentre />
        </div>
      </div>
    </div>
  );
};

export default Profile;
