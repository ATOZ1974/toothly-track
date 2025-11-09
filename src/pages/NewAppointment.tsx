import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const timeSlots = [
  { start: '09:00', end: '09:30' },
  { start: '09:30', end: '10:00' },
  { start: '10:00', end: '10:30' },
  { start: '10:30', end: '11:00' },
  { start: '11:00', end: '11:30' },
  { start: '11:30', end: '12:00' },
  { start: '12:00', end: '12:30' },
  { start: '12:30', end: '13:00' },
  { start: '14:00', end: '14:30' },
  { start: '14:30', end: '15:00' },
  { start: '15:00', end: '15:30' },
  { start: '15:30', end: '16:00' },
  { start: '16:00', end: '16:30' },
  { start: '16:30', end: '17:00' },
];

const NewAppointment = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { appointments, createAppointment } = useAppointments(selectedDate);

  const filteredPatients = patients.filter(patient =>
    patient.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSlotStatus = (slot: { start: string; end: string }) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingAppointment = appointments.find(
      apt => apt.appointment_date === dateStr && 
             apt.start_time === slot.start && 
             apt.status !== 'cancelled'
    );

    if (existingAppointment) {
      return existingAppointment.status === 'completed' ? 'completed' : 'booked';
    }

    if (selectedSlot?.start === slot.start) {
      return 'selected';
    }

    return 'available';
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    // Check if slot is already booked
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const isSlotBooked = appointments.some(
      apt => apt.appointment_date === dateStr && 
             apt.start_time === selectedSlot.start && 
             apt.status !== 'cancelled'
    );

    if (isSlotBooked) {
      toast.error('This time slot is already booked. Please select another time.');
      return;
    }

    const success = await createAppointment({
      patient_id: selectedPatient,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      status: 'scheduled',
      reminder_time: new Date(selectedDate.getTime() - 60 * 60 * 1000).toISOString(),
    });

    if (success) {
      navigate('/book-appointment');
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
              onClick={() => navigate('/book-appointment')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-semibold">Book New Appointment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search or select patient"
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-patient')}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl text-white">+</span>
            </div>
            <span className="text-xs font-medium">Add New</span>
          </motion.button>

          {filteredPatients.map((patient) => (
            <motion.button
              key={patient.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPatient(patient.id)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <Avatar className={cn(
                "w-16 h-16 border-2",
                selectedPatient === patient.id ? "border-primary" : "border-transparent"
              )}>
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                  {patient.patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium max-w-[70px] truncate">
                {patient.patient.name.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Appointment Date</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-14 justify-between text-left font-normal">
                <span>{format(selectedDate, 'dd-MM-yyyy')}</span>
                <CalendarIcon className="w-5 h-5 text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Available Slots</h2>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot) => {
              const status = getSlotStatus(slot);
              return (
                <Button
                  key={`${slot.start}-${slot.end}`}
                  variant="outline"
                  disabled={status === 'booked' || status === 'completed'}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "h-14 text-base font-medium transition-all",
                    status === 'selected' && "bg-primary text-primary-foreground border-primary shadow-md",
                    status === 'booked' && "bg-destructive/90 text-destructive-foreground border-destructive cursor-not-allowed",
                    status === 'completed' && "bg-muted text-muted-foreground opacity-60 cursor-not-allowed",
                    status === 'available' && "hover:border-primary hover:shadow-sm"
                  )}
                >
                  {slot.start} - {slot.end}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border border-border rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-primary rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-muted rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-destructive/90 rounded" />
            <span>Fully Booked</span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!selectedPatient || !selectedSlot}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          Save Appointment
        </Button>
      </div>
    </div>
  );
};

export default NewAppointment;
