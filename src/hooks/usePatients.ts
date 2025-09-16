import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PatientRecord, PatientInfo, ToothState, Treatment, ClinicalNotes, FileCategories, Payment } from '@/types/dental';

export function usePatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPatients = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load patients with their dental records and treatments
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          dental_records (
            *,
            treatments (*)
          ),
          patient_files (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Transform database data to PatientRecord format
      const records: PatientRecord[] = (patientsData || []).map(patient => {
        const dentalRecord = patient.dental_records?.[0];
        const treatments = dentalRecord?.treatments || [];
        const files = patient.patient_files || [];

        // Group files by category
        return {
          id: patient.id,
          savedAt: patient.created_at,
          patient: {
            name: patient.name,
            age: patient.age,
            dob: patient.date_of_birth || '',
            phone: patient.phone || '',
            email: patient.email || '',
          },
          teeth: (dentalRecord?.tooth_states as ToothState) || {},
          treatments: treatments.map(t => ({
            id: t.id,
            name: t.name,
            tooth: t.tooth_number,
            category: 'basic' as const,
          })),
          notes: {
            chiefComplaint: dentalRecord?.chief_complaint || '',
            clinicalNotes: dentalRecord?.clinical_notes || '',
            treatmentNotes: dentalRecord?.treatment_notes || '',
          },
          files: {
            personal: files.filter(f => f.file_category === 'personal').map(f => ({
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: supabase.storage.from('patient-files').getPublicUrl(f.file_path).data.publicUrl,
              uploadedAt: f.created_at,
            })),
            diagnostics: files.filter(f => f.file_category === 'diagnostics').map(f => ({
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: supabase.storage.from('patient-files').getPublicUrl(f.file_path).data.publicUrl,
              uploadedAt: f.created_at,
            })),
            treatment: files.filter(f => f.file_category === 'treatment').map(f => ({
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: supabase.storage.from('patient-files').getPublicUrl(f.file_path).data.publicUrl,
              uploadedAt: f.created_at,
            })),
            xrays: files.filter(f => f.file_category === 'xrays').map(f => ({
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: supabase.storage.from('patient-files').getPublicUrl(f.file_path).data.publicUrl,
              uploadedAt: f.created_at,
            })),
          },
          payments: [], // Will be added later when payments table is created
        };
      });

      setPatients(records);
    } catch (error) {
      console.error('Error loading patients:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const savePatient = async (record: Omit<PatientRecord, 'id' | 'savedAt'>, existingId?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      let patientData;

      if (existingId) {
        // Update existing patient
        const { data, error } = await supabase
          .from('patients')
          .update({
            name: record.patient.name,
            age: record.patient.age,
            date_of_birth: record.patient.dob || null,
            phone: record.patient.phone,
            email: record.patient.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        patientData = data;
      } else {
        // Create new patient
        const { data, error } = await supabase
          .from('patients')
          .insert({
            name: record.patient.name,
            age: record.patient.age,
            date_of_birth: record.patient.dob || null,
            phone: record.patient.phone,
            email: record.patient.email,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        patientData = data;
      }

      // Save or update dental record
      const { data: dentalRecordData, error: dentalRecordError } = await supabase
        .from('dental_records')
        .upsert({
          patient_id: patientData.id,
          tooth_states: record.teeth as any,
          chief_complaint: record.notes.chiefComplaint,
          clinical_notes: record.notes.clinicalNotes,
          treatment_notes: record.notes.treatmentNotes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'patient_id'
        })
        .select()
        .single();

      if (dentalRecordError) throw dentalRecordError;

      // Save treatments
      if (record.treatments.length > 0) {
        // Delete existing treatments for this dental record
        await supabase
          .from('treatments')
          .delete()
          .eq('dental_record_id', dentalRecordData.id);

        // Insert new treatments
        const { error: treatmentsError } = await supabase
          .from('treatments')
          .insert(
            record.treatments.map(treatment => ({
              dental_record_id: dentalRecordData.id,
              name: treatment.name,
              tooth_number: treatment.tooth,
            }))
          );

        if (treatmentsError) throw treatmentsError;
      }

      await loadPatients();
      return patientData.id;
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  };

  const deletePatient = async (patientId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadPatients();
    } else {
      setPatients([]);
    }
  }, [user]);

  return {
    patients,
    loading,
    loadPatients,
    savePatient,
    deletePatient,
  };
}