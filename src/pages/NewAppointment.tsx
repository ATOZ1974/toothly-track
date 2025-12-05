import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Search, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  { start: '17:00', end: '17:30' },
  { start: '17:30', end: '18:00' },
];

const NewAppointment = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { appointments, createAppointment, loading } = useAppointments(selectedDate);

  const filteredPatients = patients.filter(patient =>
    patient.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient.phone?.includes(searchQuery)
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Helper to convert time string to minutes for comparison
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if two time ranges overlap
  const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return s1 < e2 && e1 > s2;
  };

  const getSlotStatus = (slot: { start: string; end: string }) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Check for any overlapping appointment (not just exact match)
    const overlappingAppointment = appointments.find(
      apt => apt.appointment_date === dateStr && 
             apt.status !== 'cancelled' &&
             isOverlapping(slot.start, slot.end, apt.start_time, apt.end_time)
    );

    if (overlappingAppointment) {
      return overlappingAppointment.status === 'completed' ? 'completed' : 'booked';
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

    // Check if slot has any overlapping appointment
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const isSlotBooked = appointments.some(
      apt => apt.appointment_date === dateStr && 
             apt.status !== 'cancelled' &&
             isOverlapping(selectedSlot.start, selectedSlot.end, apt.start_time, apt.end_time)
    );

    if (isSlotBooked) {
      toast.error('This time slot overlaps with an existing appointment. Please select another time.');
      return;
    }

    const success = await createAppointment({
      patient_id: selectedPatient,
      appointment_date: dateStr,
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      status: 'scheduled',
      notes: notes || undefined,
      reminder_time: new Date(selectedDate.getTime() - 60 * 60 * 1000).toISOString(),
    });

    if (success) {
      navigate('/book-appointment');
    }
  };

  const availableSlots = timeSlots.filter(slot => getSlotStatus(slot) === 'available').length;
  const bookedSlots = timeSlots.filter(slot => getSlotStatus(slot) === 'booked').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
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
        {/* Patient Selection */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Select Patient</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {selectedPatientData ? (
            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-primary">
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                    {selectedPatientData.patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedPatientData.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatientData.patient.phone || 'No phone'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                Change
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/add-patient')}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xl text-white">+</span>
                </div>
                <span className="text-xs font-medium">Add New</span>
              </motion.button>

              {filteredPatients.slice(0, 10).map((patient) => (
                <motion.button
                  key={patient.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPatient(patient.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <Avatar className={cn(
                    "w-14 h-14 border-2 transition-all",
                    selectedPatient === patient.id ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                  )}>
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-sm">
                      {patient.patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium max-w-[60px] truncate">
                    {patient.patient.name.split(' ')[0]}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </Card>

        {/* Date Selection */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Date</h2>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(selectedDate, 'MMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Week View */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDate(day);
                        setSelectedSlot(null);
                      }
                    }}
                    disabled={isPast}
                    className={cn(
                      "flex flex-col items-center py-2 rounded-lg transition-all",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && isToday && "bg-primary/10",
                      !isSelected && !isPast && "hover:bg-accent",
                      isPast && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                    <span className={cn(
                      "text-lg font-bold",
                      isSelected ? "text-primary-foreground" : ""
                    )}>
                      {format(day, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Time Slots */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Time</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {availableSlots} available, {bookedSlots} booked
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const status = getSlotStatus(slot);
                  return (
                    <Button
                      key={`${slot.start}-${slot.end}`}
                      variant="outline"
                      disabled={status === 'booked' || status === 'completed'}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "h-12 text-sm font-medium transition-all",
                        status === 'selected' && "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30",
                        status === 'booked' && "bg-destructive/10 text-destructive border-destructive/30 cursor-not-allowed",
                        status === 'completed' && "bg-muted text-muted-foreground opacity-60 cursor-not-allowed",
                        status === 'available' && "hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      {slot.start}
                    </Button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-border rounded" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-destructive/30 rounded" />
                  <span>Booked</span>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Notes */}
        <Card className="p-4 space-y-3">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes for this appointment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </Card>

        {/* Summary & Save */}
        {selectedPatient && selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{selectedPatientData?.patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(selectedDate, 'EEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedSlot.start} - {selectedSlot.end}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <Button
          onClick={handleSave}
          disabled={!selectedPatient || !selectedSlot || loading}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </Button>
      </div>
    </div>
  );
};

export default NewAppointment;