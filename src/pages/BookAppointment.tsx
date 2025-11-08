import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { Plus, MoreVertical, SlidersHorizontal, Clock, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppointments } from '@/hooks/useAppointments';
import { toast } from 'sonner';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { appointments, loading, updateAppointment, deleteAppointment } = useAppointments();

  // Calculate today's appointment statistics
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
    
    return {
      requested: 0, // Not used in current status types
      queue: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      confirmed: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length,
    };
  }, [appointments]);

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: typeof appointments } = {};
    
    appointments
      .filter(apt => apt.status !== 'cancelled')
      .forEach(apt => {
        const dateKey = apt.appointment_date;
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(apt);
      });

    return Object.entries(groups).sort(([dateA], [dateB]) => 
      new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  }, [appointments]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    return format(date, 'dd-MM-yyyy');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    await updateAppointment(appointmentId, { status: newStatus });
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await deleteAppointment(appointmentId);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
              <h1 className="text-2xl font-bold">Appointment</h1>
            </div>
            <Button variant="ghost" size="icon">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today Appointments Summary */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-semibold text-center mb-6">Today Appointments</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{todayStats.requested}</p>
              <p className="text-xs text-muted-foreground mt-1">Requested</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-3xl font-bold text-blue-500">{todayStats.queue}</p>
              <p className="text-xs text-muted-foreground mt-1">Queue</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-3xl font-bold text-blue-500">{todayStats.confirmed}</p>
              <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-3xl font-bold text-green-500">{todayStats.completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
          </div>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {groupedAppointments.map(([date, dateAppointments]) => (
            <div key={date} className="space-y-3">
              {dateAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Date/Time Header */}
                  <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">
                          {getDateLabel(appointment.appointment_date)} • {appointment.start_time}
                        </span>
                      </div>
                      <Select
                        value={appointment.status}
                        onValueChange={(value) => handleStatusChange(appointment.id, value as any)}
                      >
                        <SelectTrigger className="w-[130px] bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Patient Info */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-lg font-semibold">
                            {getInitials(appointment.patient?.name || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {appointment.patient?.name || 'Unknown Patient'}
                          </p>
                          {appointment.patient?.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <Phone className="w-3 h-3" />
                              <span className="text-sm">{appointment.patient.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5 text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(appointment.id)} className="text-destructive">
                            Cancel Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ))}

          {appointments.length === 0 && !loading && (
            <Card className="glass-card p-12 text-center">
              <p className="text-muted-foreground">No appointments scheduled</p>
            </Card>
          )}
        </div>
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
          className="w-16 h-16 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          onClick={() => navigate('/new-appointment')}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>
    </div>
  );
};

export default BookAppointment;
