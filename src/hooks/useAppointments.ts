import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  reminder_sent: boolean;
  reminder_time?: string;
  patient?: {
    id: string;
    name: string;
    phone?: string;
  };
}

export function useAppointments(date?: Date) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(id, name, phone, user_id)
        `)
        .eq('patients.user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.eq('appointment_date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData = data?.map(apt => ({
        id: apt.id,
        patient_id: apt.patient_id,
        appointment_date: apt.appointment_date,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status as 'scheduled' | 'completed' | 'cancelled',
        notes: apt.notes,
        reminder_sent: apt.reminder_sent,
        reminder_time: apt.reminder_time,
        patient: apt.patients ? {
          id: apt.patients.id,
          name: apt.patients.name,
          phone: apt.patients.phone
        } : undefined
      })) || [];

      setAppointments(transformedData);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user, date]);

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'reminder_sent' | 'patient'>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([appointment]);

      if (error) throw error;

      toast.success('Appointment booked successfully');
      await loadAppointments();
      return true;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to book appointment');
      return false;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Appointment updated');
      await loadAppointments();
      return true;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
      return false;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Appointment cancelled');
      await loadAppointments();
      return true;
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to cancel appointment');
      return false;
    }
  };

  return {
    appointments,
    loading,
    loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
}
