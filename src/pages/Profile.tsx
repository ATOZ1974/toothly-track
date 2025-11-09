import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Settings as SettingsIcon,
  Video,
  Calendar,
  Settings,
  AlertTriangle,
  MessageCircle,
  LogOut,
  Globe,
  Crown,
  ChevronRight,
  QrCode,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    {
      section: 'Personal',
      items: [
        { icon: Wallet, label: 'Your Balance', path: '/balance' },
        { icon: SettingsIcon, label: 'Clinic Configuration', path: '/clinic-config' },
        { icon: Video, label: 'Video Consulting History', path: '/video-history' },
        { icon: Calendar, label: 'Share Appointment Link', path: '/share-link' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    },
    {
      section: 'Support Us',
      items: [
        { icon: AlertTriangle, label: 'Report a Problem', path: '/report-problem' },
        { icon: MessageCircle, label: 'Chat with us', path: '/chat-support' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user?.user_metadata?.full_name || 'Dr. User'}
                  </h2>
                  <button
                    onClick={() => navigate('/update-profile')}
                    className="text-sm text-primary hover:underline"
                  >
                    Update profile
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                  <QrCode className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Get Premium Card */}
        <Card 
          className="bg-primary text-primary-foreground p-4 cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => navigate('/premium')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6" />
              <span className="text-lg font-semibold">Get Premium</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
        </Card>

        {/* Menu Sections */}
        {menuItems.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-sm text-muted-foreground px-2 font-medium">
              {section.section}
            </h3>
            <Card className="divide-y">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-base flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        <Separator className="my-4" />

        {/* Logout */}
        <Card>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <span className="text-base">Logout</span>
          </button>
        </Card>

        {/* Go to Web App */}
        <Card>
          <button
            onClick={() => window.open(window.location.origin, '_blank')}
            className="w-full flex items-center gap-4 p-4 hover:bg-accent transition-colors"
          >
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-base flex-1 text-left">Go To Web App</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>

        {/* App Version */}
        <p className="text-sm text-muted-foreground text-center py-4">
          App version 12.2.8
        </p>
      </div>
    </div>
  );
};

export default Profile;
