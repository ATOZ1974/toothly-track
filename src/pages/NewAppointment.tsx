import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Search, Clock, User, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useClinicSettings, getDayKey } from '@/hooks/useClinicSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Helper to convert time string to minutes for comparison
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Generate available start times based on working hours
const generateStartTimes = (startHour: string, endHour: string) => {
  const times: string[] = [];
  const startMins = timeToMinutes(startHour);
  const endMins = timeToMinutes(endHour);
  
  for (let mins = startMins; mins < endMins; mins += 15) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    times.push(timeStr);
  }
  return times;
};

// Helper to add minutes to a time string
const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60);
  const newMins = totalMins % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const NewAppointment = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { settings: clinicSettings } = useClinicSettings();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { appointments, createAppointment, loading } = useAppointments(selectedDate);

  // Get working hours for selected date
  const dayKey = getDayKey(selectedDate);
  const dayHours = clinicSettings.weeklyHours[dayKey];
  const isClinicOpen = dayHours.isOpen;

  // Get selected appointment type and its duration
  const selectedTypeData = clinicSettings.appointmentTypes.find(t => t.id === selectedAppointmentType);
  const selectedDuration = selectedTypeData?.defaultDuration || 30;

  // Generate start times based on day-specific working hours
  const startTimes = useMemo(() => {
    if (!isClinicOpen) return [];
    return generateStartTimes(dayHours.start, dayHours.end);
  }, [isClinicOpen, dayHours.start, dayHours.end]);

  // Calculate selected slot based on time and duration
  const selectedSlot = useMemo(() => {
    if (!selectedTime) return null;
    return {
      start: selectedTime,
      end: addMinutesToTime(selectedTime, selectedDuration)
    };
  }, [selectedTime, selectedDuration]);

  const filteredPatients = patients.filter(patient =>
    patient.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient.phone?.includes(searchQuery)
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Check if two time ranges overlap
  const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return s1 < e2 && e1 > s2;
  };

  // Get overlapping appointment for a time slot
  const getOverlappingAppointment = (startTime: string) => {
    const endTime = addMinutesToTime(startTime, selectedDuration);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return appointments.find(
      apt => apt.appointment_date === dateStr && 
             apt.status !== 'cancelled' &&
             isOverlapping(startTime, endTime, apt.start_time, apt.end_time)
    );
  };

  // Get status for a time slot given start time and duration
  const getTimeStatus = (startTime: string) => {
    const endTime = addMinutesToTime(startTime, selectedDuration);
    
    // Check if end time exceeds working hours for the day
    if (timeToMinutes(endTime) > timeToMinutes(dayHours.end)) {
      return 'unavailable';
    }
    
    // Check for any overlapping appointment
    const overlappingAppointment = getOverlappingAppointment(startTime);

    if (overlappingAppointment) {
      return overlappingAppointment.status === 'completed' ? 'completed' : 'booked';
    }

    if (selectedTime === startTime) {
      return 'selected';
    }

    return 'available';
  };

  // Filter start times that can fit the selected duration
  const availableStartTimes = useMemo(() => {
    if (!isClinicOpen) return [];
    return startTimes.filter(time => {
      const endTime = addMinutesToTime(time, selectedDuration);
      return timeToMinutes(endTime) <= timeToMinutes(dayHours.end);
    });
  }, [startTimes, selectedDuration, dayHours.end, isClinicOpen]);

  const handleSave = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!selectedAppointmentType) {
      toast.error('Please select an appointment type');
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

    const appointmentNotes = selectedTypeData 
      ? `${selectedTypeData.name}${notes ? ` - ${notes}` : ''}`
      : notes;

    const success = await createAppointment({
      patient_id: selectedPatient,
      appointment_date: dateStr,
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      status: 'scheduled',
      notes: appointmentNotes || undefined,
      reminder_time: new Date(selectedDate.getTime() - 60 * 60 * 1000).toISOString(),
    });

    if (success) {
      navigate('/book-appointment');
    }
  };

  const availableSlots = availableStartTimes.filter(time => getTimeStatus(time) === 'available').length;
  const bookedSlots = availableStartTimes.filter(time => getTimeStatus(time) === 'booked').length;

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
                      setSelectedTime(null);
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
                        setSelectedTime(null);
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

        {/* Appointment Type Selection */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Appointment Type</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {clinicSettings.appointmentTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedAppointmentType === type.id ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedAppointmentType(type.id);
                  setSelectedTime(null); // Reset time when type changes
                }}
                className={cn(
                  "h-auto py-3 px-4 flex flex-col items-start gap-1 transition-all",
                  selectedAppointmentType === type.id && "shadow-md ring-2 ring-primary/30"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="font-medium text-sm">{type.name}</span>
                </div>
                <span className={cn(
                  "text-xs",
                  selectedAppointmentType === type.id ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {type.defaultDuration} min
                </span>
              </Button>
            ))}
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

          {!isClinicOpen ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Clinic is closed on {format(selectedDate, 'EEEE')}s</p>
              <p className="text-sm text-muted-foreground mt-1">Please select another date</p>
            </div>
          ) : !selectedAppointmentType ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Please select an appointment type first</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <TooltipProvider>
                <div className="grid grid-cols-4 gap-2">
                  {availableStartTimes.map((time) => {
                    const status = getTimeStatus(time);
                    const overlappingApt = getOverlappingAppointment(time);
                    const patientData = overlappingApt 
                      ? patients.find(p => p.id === overlappingApt.patient_id) 
                      : null;
                    
                    const button = (
                      <Button
                        key={time}
                        variant="outline"
                        disabled={status === 'booked' || status === 'completed' || status === 'unavailable'}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "h-12 text-sm font-medium transition-all",
                          status === 'selected' && "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30",
                          status === 'booked' && "bg-destructive/10 text-destructive border-destructive/30 cursor-not-allowed",
                          status === 'completed' && "bg-muted text-muted-foreground opacity-60 cursor-not-allowed",
                          status === 'available' && "hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {time}
                      </Button>
                    );

                    if ((status === 'booked' || status === 'completed') && overlappingApt && patientData) {
                      return (
                        <Tooltip key={time}>
                          <TooltipTrigger asChild>
                            {button}
                          </TooltipTrigger>
                          <TooltipContent className="p-3 max-w-[200px]">
                            <div className="space-y-1">
                              <p className="font-semibold">{patientData.patient.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {overlappingApt.start_time} - {overlappingApt.end_time}
                              </p>
                              {patientData.patient.phone && (
                                <p className="text-xs">{patientData.patient.phone}</p>
                              )}
                              {overlappingApt.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{overlappingApt.notes}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return button;
                  })}
                </div>
              </TooltipProvider>

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
        {selectedPatient && selectedSlot && selectedTypeData && (
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
                  <span className="text-muted-foreground">Type:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: selectedTypeData.color }}
                    />
                    <span className="font-medium">{selectedTypeData.name}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(selectedDate, 'EEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedSlot.start} - {selectedSlot.end}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{selectedDuration} minutes</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <Button
          onClick={handleSave}
          disabled={!selectedPatient || !selectedAppointmentType || !selectedTime || loading}
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