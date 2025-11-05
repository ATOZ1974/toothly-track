import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RevenueCharts } from './RevenueCharts';
import { KPICards } from './KPICards';
import { ReportExport } from './ReportExport';
import { cn } from '@/lib/utils';

export function RevenueDashboard() {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showExport, setShowExport] = useState(false);

  const { loading, summary, revenueData, paymentMethods, topTreatments } = useAnalytics(startDate, endDate);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Track your practice performance and revenue insights
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="inline-block"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 inline" />
                </motion.div>
                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col sm:flex-row gap-2 p-4">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > endDate}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date</p>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < startDate || date > new Date()}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => setShowExport(true)}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block"
            >
              <Download className="mr-2 h-4 w-4 inline" />
            </motion.div>
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards summary={summary} loading={loading} />

      {/* Charts */}
      <RevenueCharts
        revenueData={revenueData}
        paymentMethods={paymentMethods}
        topTreatments={topTreatments}
        loading={loading}
      />

      {/* Export Dialog */}
      {showExport && (
        <ReportExport
          summary={summary}
          revenueData={revenueData}
          paymentMethods={paymentMethods}
          topTreatments={topTreatments}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
