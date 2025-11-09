import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, QrCode as QrCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ShareLink = () => {
  const navigate = useNavigate();
  const [appointmentLink] = useState('https://dental-app.com/book/dr-praavin');

  const handleCopy = () => {
    navigator.clipboard.writeText(appointmentLink);
    toast.success('Link copied to clipboard');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book an Appointment',
          text: 'Book an appointment with me using this link',
          url: appointmentLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
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
            <h1 className="text-xl font-semibold">Share Appointment Link</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Your Appointment Link</h3>
            <p className="text-sm text-muted-foreground">
              Share this link with your patients so they can book appointments directly
            </p>
          </div>

          <div className="flex gap-2">
            <Input value={appointmentLink} readOnly className="flex-1" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleShare} variant="outline" className="w-full">
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="w-full">
              <QrCodeIcon className="w-5 h-5 mr-2" />
              QR Code
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">How it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">1.</span>
              <span>Share your appointment link with patients</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">2.</span>
              <span>Patients can view available time slots</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">3.</span>
              <span>They book directly on your calendar</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">4.</span>
              <span>You receive automatic notifications</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ShareLink;
