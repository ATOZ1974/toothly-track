import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const AppSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    smsReminders: false,
    darkMode: false,
    autoBackup: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Settings updated');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="cursor-pointer">
                  Push Notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={() => handleToggle('notifications')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications" className="cursor-pointer">
                  Email Notifications
                </Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="smsReminders" className="cursor-pointer">
                  SMS Reminders
                </Label>
                <Switch
                  id="smsReminders"
                  checked={settings.smsReminders}
                  onCheckedChange={() => handleToggle('smsReminders')}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="cursor-pointer">
                  Dark Mode
                </Label>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={() => handleToggle('darkMode')}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Data & Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup" className="cursor-pointer">
                  Automatic Backup
                </Label>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={() => handleToggle('autoBackup')}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppSettings;
