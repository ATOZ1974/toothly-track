import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedNav } from '@/components/AnimatedNav';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePatients } from '@/hooks/usePatients';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow } from 'date-fns';
import { 
  UserPlus, 
  ClipboardPlus, 
  DollarSign, 
  Calendar,
  Eye,
  CalendarPlus,
  User,
  Pill,
  CalendarCheck,
  Search,
  Clock
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportPeriod, setReportPeriod] = useState<'today' | '7days' | '30days'>('today');
  const [activityTab, setActivityTab] = useState('patient');
  const { patients, loading: patientsLoading } = usePatients();

  // Calculate date range based on report period
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    if (reportPeriod === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (reportPeriod === '7days') {
      start.setDate(start.getDate() - 7);
    } else {
      start.setDate(start.getDate() - 30);
    }
    
    return { startDate: start, endDate: end };
  }, [reportPeriod]);

  const { summary, loading: analyticsLoading } = useAnalytics(startDate, endDate);
  const { appointments, loading: appointmentsLoading } = useAppointments();

  // Get upcoming appointments (scheduled only)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.appointment_date + 'T' + apt.start_time);
        return aptDate >= now && apt.status === 'scheduled';
      })
      .sort((a, b) => {
        const dateA = new Date(a.appointment_date + 'T' + a.start_time);
        const dateB = new Date(b.appointment_date + 'T' + b.start_time);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  }, [appointments]);

  const nextAppointment = upcomingAppointments[0];

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 
                   user?.email?.split('@')[0] || 
                   'Doctor';

  const dashboardCards = [
    {
      title: 'Patients',
      count: patientsLoading ? '...' : patients.length,
      icon: User,
      gradient: 'from-cyan-400 to-blue-500',
      buttonText: 'Add Patient',
      buttonIcon: UserPlus,
      action: () => navigate('/add-patient')
    },
    {
      title: 'Treatments',
      count: analyticsLoading ? '...' : summary.totalTreatments,
      icon: Pill,
      gradient: 'from-rose-400 to-pink-500',
      buttonText: 'Add Treatment',
      buttonIcon: ClipboardPlus,
      action: () => navigate('/add-patient')
    },
    {
      title: 'Collection',
      count: analyticsLoading ? '...' : `₹${summary.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-orange-400 to-amber-500',
      buttonText: 'View Report',
      buttonIcon: Eye,
      action: () => navigate('/analytics')
    },
    {
      title: 'Appointments',
      count: appointmentsLoading ? '...' : appointments.filter(a => a.status === 'scheduled').length,
      icon: CalendarCheck,
      gradient: 'from-emerald-400 to-teal-500',
      buttonText: 'Book Now',
      buttonIcon: CalendarPlus,
      action: () => navigate('/book-appointment')
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen relative pb-20">
        <AnimatedNav />
        
        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {getGreeting()} ☀️
            </h1>
            <p className="text-lg text-muted-foreground">Dr. {userName}</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search patients, treatments..." 
              className="pl-10 h-12 glass-card"
            />
          </motion.div>

          {/* Report Period Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold text-foreground">Report</h2>
            <div className="flex gap-2">
              {(['today', '7days', '30days'] as const).map((period) => (
                <Button
                  key={period}
                  variant={reportPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportPeriod(period)}
                  className={reportPeriod === period ? '' : 'glass-button'}
                >
                  {period === 'today' ? 'Today' : period === '7days' ? '7 Days' : '30 Days'}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-2 gap-4">
            {dashboardCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className={`relative overflow-hidden p-6 bg-gradient-to-br ${card.gradient} border-none text-white cursor-pointer transition-transform hover:scale-105`}>
                  {/* Background Pattern */}
                  <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
                    <card.icon className="w-full h-full" />
                  </div>
                  
                  <div className="relative space-y-4">
                    <div>
                      <p className="text-4xl font-bold">{card.count}</p>
                      <p className="text-lg font-medium mt-1">{card.title}</p>
                    </div>
                    
                    <Button
                      onClick={card.action}
                      className="bg-white/90 hover:bg-white text-gray-900 font-medium shadow-lg"
                      size="sm"
                    >
                      <card.buttonIcon className="w-4 h-4 mr-2" />
                      {card.buttonText}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Upcoming appointment</h2>
              {upcomingAppointments.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/book-appointment')}>
                  View All
                </Button>
              )}
            </div>

            {nextAppointment ? (
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{nextAppointment.patient?.name}</p>
                      <p className="text-sm text-muted-foreground">{nextAppointment.patient?.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {getDateLabel(nextAppointment.appointment_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{nextAppointment.start_time} - {nextAppointment.end_time}</span>
                </div>
                {upcomingAppointments.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    +{upcomingAppointments.length - 1} more appointment{upcomingAppointments.length > 2 ? 's' : ''}
                  </p>
                )}
              </Card>
            ) : (
              <Card className="glass-card p-8 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-primary" />
                </div>
                <p className="text-foreground font-medium">You don't have any appointment</p>
                <Button className="w-full sm:w-auto" onClick={() => navigate('/book-appointment')}>
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              </Card>
            )}
          </motion.div>

          {/* Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground">Activity</h2>
            
            <Tabs value={activityTab} onValueChange={setActivityTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass-card">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
                <TabsTrigger value="appointment">Appointment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="patient" className="mt-4">
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">No recent patient activity</p>
                </Card>
              </TabsContent>
              
              <TabsContent value="treatment" className="mt-4">
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">No recent treatment activity</p>
                </Card>
              </TabsContent>
              
              <TabsContent value="appointment" className="mt-4">
                <Card className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">No recent appointment activity</p>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 glass-nav border-t z-50"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-5 gap-2 py-3">
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 text-primary"
                onClick={() => navigate('/')}
              >
                <div className="w-6 h-6 mb-1 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Home</span>
              </Button>
              
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 text-muted-foreground"
                onClick={() => navigate('/add-patient')}
              >
                <UserPlus className="w-6 h-6 mb-1" />
                <span className="text-xs">Patient</span>
              </Button>
              
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 text-muted-foreground"
              >
                <Pill className="w-6 h-6 mb-1" />
                <span className="text-xs">Rx</span>
              </Button>
              
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 text-muted-foreground"
                onClick={() => navigate('/book-appointment')}
              >
                <Calendar className="w-6 h-6 mb-1" />
                <span className="text-xs">Calendar</span>
              </Button>
              
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 text-muted-foreground"
                onClick={() => navigate('/analytics')}
              >
                <Eye className="w-6 h-6 mb-1" />
                <span className="text-xs">Report</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Home;
