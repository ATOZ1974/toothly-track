import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useClinicSettings } from '@/hooks/useClinicSettings';

const ClinicConfig = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useClinicSettings();

  const handleSave = () => {
    toast.success('Clinic configuration saved successfully');
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
            <h1 className="text-xl font-semibold">Clinic Configuration</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              value={settings.clinicName}
              onChange={(e) => updateSettings({ clinicName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => updateSettings({ address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => updateSettings({ phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSettings({ email: e.target.value })}
            />
          </div>

          {/* Working Hours Configuration */}
          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Working Hours</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart" className="text-sm text-muted-foreground">Start Time</Label>
                <Input
                  id="workingHoursStart"
                  type="time"
                  value={settings.workingHoursStart}
                  onChange={(e) => updateSettings({ workingHoursStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd" className="text-sm text-muted-foreground">End Time</Label>
                <Input
                  id="workingHoursEnd"
                  type="time"
                  value={settings.workingHoursEnd}
                  onChange={(e) => updateSettings({ workingHoursEnd: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              These hours will be used for appointment scheduling
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => updateSettings({ description: e.target.value })}
              rows={4}
            />
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            <Save className="w-5 h-5 mr-2" />
            Save Configuration
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ClinicConfig;
