import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useClinicSettings, WeeklyHours } from '@/hooks/useClinicSettings';

const dayLabels: Record<keyof WeeklyHours, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const dayOrder: (keyof WeeklyHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ClinicConfig = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, updateDayHours } = useClinicSettings();

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
        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => updateSettings({ description: e.target.value })}
              rows={3}
            />
          </div>
        </Card>

        {/* Weekly Working Hours */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Weekly Working Hours</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Set different hours for each day of the week
          </p>

          <div className="space-y-3">
            {dayOrder.map((day) => {
              const dayHours = settings.weeklyHours[day];
              return (
                <div 
                  key={day} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    dayHours.isOpen ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="w-24 flex items-center gap-2">
                    <Switch
                      checked={dayHours.isOpen}
                      onCheckedChange={(checked) => updateDayHours(day, { isOpen: checked })}
                    />
                    <span className={`text-sm font-medium ${!dayHours.isOpen && 'text-muted-foreground'}`}>
                      {dayLabels[day].slice(0, 3)}
                    </span>
                  </div>
                  
                  {dayHours.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={dayHours.start}
                        onChange={(e) => updateDayHours(day, { start: e.target.value })}
                        className="w-28 h-9"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={dayHours.end}
                        onChange={(e) => updateDayHours(day, { end: e.target.value })}
                        className="w-28 h-9"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Appointment Types */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Appointment Types</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Default durations for different appointment types
          </p>

          <div className="grid gap-3">
            {settings.appointmentTypes.map((type) => (
              <div 
                key={type.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="font-medium">{type.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {type.defaultDuration} min
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="w-5 h-5 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ClinicConfig;
