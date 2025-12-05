import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Appointment } from '@/hooks/useAppointments';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  viewMode?: 'month' | 'week';
}

export const AppointmentCalendar = ({ 
  appointments, 
  onDateSelect, 
  selectedDate = new Date(),
  viewMode: initialViewMode = 'month'
}: AppointmentCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>(initialViewMode);

  // Get appointments count for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  // Generate calendar days for month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Generate week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Week day headers */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {monthDays.map((day, index) => {
        const dayAppointments = getAppointmentsForDate(day);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const hasAppointments = dayAppointments.length > 0;

        return (
          <motion.button
            key={day.toISOString()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            onClick={() => onDateSelect?.(day)}
            className={cn(
              "relative aspect-square p-1 rounded-lg transition-all text-sm",
              "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30",
              !isCurrentMonth && "text-muted-foreground/50",
              isToday && !isSelected && "bg-primary/10 font-bold",
              isSelected && "bg-primary text-primary-foreground font-bold shadow-md"
            )}
          >
            <span className={cn(
              "absolute top-1 left-1/2 -translate-x-1/2",
              isSelected ? "text-primary-foreground" : ""
            )}>
              {format(day, 'd')}
            </span>
            
            {hasAppointments && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {dayAppointments.slice(0, 3).map((apt, i) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      getStatusColor(apt.status)
                    )}
                  />
                ))}
                {dayAppointments.length > 3 && (
                  <span className="text-[8px] text-muted-foreground">+{dayAppointments.length - 3}</span>
                )}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all",
                "hover:bg-accent",
                isToday && !isSelected && "bg-primary/10",
                isSelected && "bg-primary text-primary-foreground shadow-md"
              )}
            >
              <span className="text-xs font-medium">{format(day, 'EEE')}</span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
              {dayAppointments.length > 0 && (
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className="text-[10px] px-1.5 mt-1"
                >
                  {dayAppointments.length}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Day appointments list */}
      <Card className="p-3">
        <h4 className="text-sm font-semibold mb-2">
          {format(selectedDate, 'EEEE, dd MMMM')}
        </h4>
        <ScrollArea className="h-[200px]">
          {getAppointmentsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getAppointmentsForDate(selectedDate)
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border",
                      apt.status === 'cancelled' && "opacity-50"
                    )}
                  >
                    <div className={cn("w-1 h-8 rounded-full", getStatusColor(apt.status))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {apt.patient?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.start_time} - {apt.end_time}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] capitalize",
                        apt.status === 'scheduled' && "text-blue-600 border-blue-200",
                        apt.status === 'completed' && "text-green-600 border-green-200",
                        apt.status === 'cancelled' && "text-red-600 border-red-200"
                      )}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No appointments
            </p>
          )}
        </ScrollArea>
      </Card>
    </div>
  );

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Calendar View</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <Button
              variant={viewMode === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-7 px-3 text-xs"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-7 px-3 text-xs"
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h4 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <span>Cancelled</span>
        </div>
      </div>

      {/* Selected date appointments count */}
      {selectedDate && (
        <div className="text-center text-sm text-muted-foreground">
          {getAppointmentsForDate(selectedDate).length} appointment(s) on {format(selectedDate, 'dd MMM')}
        </div>
      )}
    </Card>
  );
};
