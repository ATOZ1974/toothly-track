import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RevenueData {
  date: string;
  amount: number;
  count: number;
}

export interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
}

export interface TreatmentData {
  name: string;
  count: number;
  revenue: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalPatients: number;
  totalTreatments: number;
  avgTreatmentValue: number;
  revenueGrowth: number;
}

export function useAnalytics(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalRevenue: 0,
    totalPatients: 0,
    totalTreatments: 0,
    avgTreatmentValue: 0,
    revenueGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [topTreatments, setTopTreatments] = useState<TreatmentData[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, startDate, endDate]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get payments in date range
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          patient:patients!inner(user_id)
        `)
        .gte('paid_at', startDate.toISOString())
        .lte('paid_at', endDate.toISOString())
        .eq('patient.user_id', user.id);

      if (paymentsError) throw paymentsError;

      // Get patients count
      const { count: patientsCount, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (patientsError) throw patientsError;

      // Get treatments with cost
      const { data: treatments, error: treatmentsError } = await supabase
        .from('treatments')
        .select(`
          *,
          dental_record:dental_records!inner(
            patient:patients!inner(user_id)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('dental_record.patient.user_id', user.id);

      if (treatmentsError) throw treatmentsError;

      // Calculate summary
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const totalTreatments = treatments?.length || 0;
      const avgTreatmentValue = totalTreatments > 0 ? totalRevenue / totalTreatments : 0;

      setSummary({
        totalRevenue,
        totalPatients: patientsCount || 0,
        totalTreatments,
        avgTreatmentValue,
        revenueGrowth: 0, // Calculate based on previous period if needed
      });

      // Revenue by date
      const revenueByDate = payments?.reduce((acc: { [key: string]: { amount: number; count: number } }, payment) => {
        const date = new Date(payment.paid_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { amount: 0, count: 0 };
        }
        acc[date].amount += Number(payment.amount);
        acc[date].count += 1;
        return acc;
      }, {}) || {};

      setRevenueData(
        Object.entries(revenueByDate).map(([date, data]) => ({
          date,
          amount: data.amount,
          count: data.count,
        })).sort((a, b) => a.date.localeCompare(b.date))
      );

      // Payment methods breakdown
      const methodsBreakdown = payments?.reduce((acc: { [key: string]: { amount: number; count: number } }, payment) => {
        const method = payment.payment_method;
        if (!acc[method]) {
          acc[method] = { amount: 0, count: 0 };
        }
        acc[method].amount += Number(payment.amount);
        acc[method].count += 1;
        return acc;
      }, {}) || {};

      setPaymentMethods(
        Object.entries(methodsBreakdown).map(([method, data]) => ({
          method,
          amount: data.amount,
          count: data.count,
        }))
      );

      // Top treatments by count and revenue
      const treatmentStats = treatments?.reduce((acc: { [key: string]: { count: number; revenue: number } }, treatment) => {
        const name = treatment.name;
        if (!acc[name]) {
          acc[name] = { count: 0, revenue: 0 };
        }
        acc[name].count += 1;
        acc[name].revenue += Number(treatment.cost || 0);
        return acc;
      }, {}) || {};

      setTopTreatments(
        Object.entries(treatmentStats)
          .map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
      );

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    summary,
    revenueData,
    paymentMethods,
    topTreatments,
    refresh: loadAnalytics,
  };
}
