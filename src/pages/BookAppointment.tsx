import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Plus, MoreVertical, SlidersHorizontal, Clock, Phone, ArrowLeft, Calendar, Search, Edit, Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { toast } from 'sonner';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { appointments, loading, updateAppointment, deleteAppointment, loadAppointments } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; appointmentId: string; notes: string }>({
    open: false,
    appointmentId: '',
    notes: ''
  });
  const [rescheduleDialog, setRescheduleDialog] = useState<{ open: boolean; appointmentId: string; date: string; time: string }>({
    open: false,
    appointmentId: '',
    date: '',
    time: ''
  });

  // Calculate today's appointment statistics
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
    
    return {
      total: todayAppointments.length,
      queue: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: todayAppointments.filter(apt => apt.status === 'cancelled').length,
    };
  }, [appointments]);

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, filterStatus]);

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: typeof appointments } = {};
    
    filteredAppointments.forEach(apt => {
      const dateKey = apt.appointment_date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(apt);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => 
      new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  }, [filteredAppointments]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, dd MMM yyyy');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    const success = await updateAppointment(appointmentId, { status: newStatus });
    if (success) {
      toast.success(`Appointment ${newStatus}`);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      await deleteAppointment(appointmentId);
    }
  };

  const handleSaveNotes = async () => {
    const success = await updateAppointment(notesDialog.appointmentId, { notes: notesDialog.notes });
    if (success) {
      toast.success('Notes saved');
      setNotesDialog({ open: false, appointmentId: '', notes: '' });
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog.date || !rescheduleDialog.time) {
      toast.error('Please select date and time');
      return;
    }

    const [startTime] = rescheduleDialog.time.split('-');
    const endTime = format(
      new Date(`2000-01-01T${startTime}:00`).getTime() + 30 * 60 * 1000,
      'HH:mm'
    );

    const success = await updateAppointment(rescheduleDialog.appointmentId, {
      appointment_date: rescheduleDialog.date,
      start_time: startTime.trim(),
      end_time: endTime
    });

    if (success) {
      toast.success('Appointment rescheduled');
      setRescheduleDialog({ open: false, appointmentId: '', date: '', time: '' });
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-bold">Appointments</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => loadAppointments()}>
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Summary */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-6">
          <h2 className="text-lg font-semibold text-center mb-4">Today's Summary</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{todayStats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-3xl font-bold text-blue-500">{todayStats.queue}</p>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-3xl font-bold text-green-500">{todayStats.completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-3xl font-bold text-red-500">{todayStats.cancelled}</p>
              <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patient..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {groupedAppointments
              .filter(([date]) => new Date(date) >= new Date(new Date().toDateString()))
              .map(([date, dateAppointments]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-primary">{getDateLabel(date)}</h3>
                    <Badge variant="outline" className="ml-auto">{dateAppointments.length} appointments</Badge>
                  </div>
                  {dateAppointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="overflow-hidden">
                        <div className={`p-4 flex items-center justify-between ${
                          appointment.status === 'cancelled' ? 'opacity-60' : ''
                        }`}>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white font-semibold">
                                {getInitials(appointment.patient?.name || 'UN')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {appointment.patient?.name || 'Unknown Patient'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{appointment.start_time} - {appointment.end_time}</span>
                              </div>
                              {appointment.patient?.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{appointment.patient.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(appointment.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setNotesDialog({ 
                                  open: true, 
                                  appointmentId: appointment.id, 
                                  notes: appointment.notes || '' 
                                })}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Add/Edit Notes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRescheduleDialog({
                                  open: true,
                                  appointmentId: appointment.id,
                                  date: appointment.appointment_date,
                                  time: appointment.start_time
                                })}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'cancelled')}>
                                  Mark Cancelled
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(appointment.id)} 
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="px-4 pb-3 pt-0">
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ))}

            {groupedAppointments.filter(([date]) => new Date(date) >= new Date(new Date().toDateString())).length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Button 
                  onClick={() => navigate('/new-appointment')} 
                  className="mt-4"
                >
                  Book New Appointment
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-4">
            {groupedAppointments
              .filter(([date]) => new Date(date) < new Date(new Date().toDateString()))
              .reverse()
              .map(([date, dateAppointments]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-muted-foreground">{format(parseISO(date), 'EEE, dd MMM yyyy')}</h3>
                  </div>
                  {dateAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4 opacity-70">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {getInitials(appointment.patient?.name || 'UN')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{appointment.patient?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{appointment.start_time}</p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </Card>
                  ))}
                </div>
              ))}

            {groupedAppointments.filter(([date]) => new Date(date) < new Date(new Date().toDateString())).length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No past appointments</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-24 right-6 z-50"
      >
        <Button
          size="icon"
          className="w-16 h-16 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={() => navigate('/new-appointment')}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Notes Dialog */}
      <Dialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog({ ...notesDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes about this appointment..."
              value={notesDialog.notes}
              onChange={(e) => setNotesDialog({ ...notesDialog, notes: e.target.value })}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialog({ open: false, appointmentId: '', notes: '' })}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ ...rescheduleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input
                type="date"
                value={rescheduleDialog.date}
                onChange={(e) => setRescheduleDialog({ ...rescheduleDialog, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>New Time</Label>
              <Select
                value={rescheduleDialog.time}
                onValueChange={(value) => setRescheduleDialog({ ...rescheduleDialog, time: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog({ open: false, appointmentId: '', date: '', time: '' })}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookAppointment;