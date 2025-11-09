import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ClinicConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    clinicName: 'Smile Dental Clinic',
    address: '123 Health Street, Medical District',
    phone: '+1 234 567 8900',
    email: 'info@smiledental.com',
    workingHours: '9:00 AM - 6:00 PM',
    description: 'A modern dental clinic providing comprehensive oral healthcare services.'
  });

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
              value={config.clinicName}
              onChange={(e) => setConfig({ ...config, clinicName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingHours">Working Hours</Label>
            <Input
              id="workingHours"
              value={config.workingHours}
              onChange={(e) => setConfig({ ...config, workingHours: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
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
