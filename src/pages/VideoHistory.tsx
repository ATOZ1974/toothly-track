import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VideoHistory = () => {
  const navigate = useNavigate();

  const consultations = [
    { id: 1, patient: 'John Doe', date: '2025-11-08', time: '10:30 AM', duration: '25 min', status: 'completed' },
    { id: 2, patient: 'Jane Smith', date: '2025-11-07', time: '2:00 PM', duration: '30 min', status: 'completed' },
    { id: 3, patient: 'Mike Johnson', date: '2025-11-06', time: '11:00 AM', duration: '20 min', status: 'completed' },
    { id: 4, patient: 'Sarah Williams', date: '2025-11-05', time: '3:30 PM', duration: '35 min', status: 'completed' },
  ];

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
            <h1 className="text-xl font-semibold">Video Consulting History</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {consultations.map(consultation => (
          <Card key={consultation.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{consultation.patient}</h3>
                  <Badge variant="secondary">{consultation.status}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{consultation.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{consultation.time} • {consultation.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoHistory;
