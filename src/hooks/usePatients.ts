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
      // Load patients with their dental records, treatments, files, and payments
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          dental_records (
            *,
            treatments (*)
          ),
          patient_files (*),
          payments (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Transform database data to PatientRecord format
      const records: PatientRecord[] = await Promise.all((patientsData || []).map(async patient => {
        const dentalRecord = Array.isArray(patient.dental_records)
          ? patient.dental_records[0]
          : patient.dental_records;
        const treatments = dentalRecord?.treatments || [];
        const files = patient.patient_files || [];
        const payments = patient.payments || [];

        // Generate signed URLs for files (removed console logging of PHI)

        // Group files by category
        // Generate signed URLs for each file (async processing)
        const personalFiles = await Promise.all(
          files.filter(f => f.file_category === 'personal').map(async (f) => {
            const { data } = await supabase.storage.from('patient-files').createSignedUrl(f.file_path, 3600);
            return {
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: data?.signedUrl || '',
              uploadedAt: f.created_at,
            };
          })
        );

        const diagnosticsFiles = await Promise.all(
          files.filter(f => f.file_category === 'diagnostics').map(async (f) => {
            const { data } = await supabase.storage.from('patient-files').createSignedUrl(f.file_path, 3600);
            return {
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: data?.signedUrl || '',
              uploadedAt: f.created_at,
            };
          })
        );

        const treatmentFiles = await Promise.all(
          files.filter(f => f.file_category === 'treatment').map(async (f) => {
            const { data } = await supabase.storage.from('patient-files').createSignedUrl(f.file_path, 3600);
            return {
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: data?.signedUrl || '',
              uploadedAt: f.created_at,
            };
          })
        );

        const xraysFiles = await Promise.all(
          files.filter(f => f.file_category === 'xrays').map(async (f) => {
            const { data } = await supabase.storage.from('patient-files').createSignedUrl(f.file_path, 3600);
            return {
              name: f.file_name,
              size: f.file_size || 0,
              type: f.mime_type || '',
              dataUrl: data?.signedUrl || '',
              uploadedAt: f.created_at,
            };
          })
        );

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
            personal: personalFiles,
            diagnostics: diagnosticsFiles,
            treatment: treatmentFiles,
            xrays: xraysFiles,
          },
          payments: payments.map(p => ({
            id: p.id,
            amount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount,
            method: p.payment_method as 'cash' | 'card' | 'upi' | 'insurance' | 'other',
            paidAt: p.paid_at,
            notes: p.notes || undefined,
          })),
        };
      }));

      setPatients(records);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const savePatient = async (record: Omit<PatientRecord, 'id' | 'savedAt'>, existingId?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Removed console logging of patient PHI data

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

      // Check if dental record exists
      const { data: existingDentalRecord } = await supabase
        .from('dental_records')
        .select('id')
        .eq('patient_id', patientData.id)
        .single();

      let dentalRecordData;
      if (existingDentalRecord) {
        // Update existing dental record
        const { data, error: dentalRecordError } = await supabase
          .from('dental_records')
          .update({
            tooth_states: record.teeth as any,
            chief_complaint: record.notes.chiefComplaint,
            clinical_notes: record.notes.clinicalNotes,
            treatment_notes: record.notes.treatmentNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDentalRecord.id)
          .select()
          .single();

        if (dentalRecordError) throw dentalRecordError;
        dentalRecordData = data;
      } else {
        // Create new dental record
        const { data, error: dentalRecordError } = await supabase
          .from('dental_records')
          .insert({
            patient_id: patientData.id,
            tooth_states: record.teeth as any,
            chief_complaint: record.notes.chiefComplaint,
            clinical_notes: record.notes.clinicalNotes,
            treatment_notes: record.notes.treatmentNotes,
          })
          .select()
          .single();

        if (dentalRecordError) throw dentalRecordError;
        dentalRecordData = data;
      }

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

      // Save files to database if they don't exist yet
      const allFiles = [
        ...record.files.personal.map(f => ({ ...f, category: 'personal' })),
        ...record.files.diagnostics.map(f => ({ ...f, category: 'diagnostics' })),
        ...record.files.treatment.map(f => ({ ...f, category: 'treatment' })),
        ...record.files.xrays.map(f => ({ ...f, category: 'xrays' })),
      ];

      if (allFiles.length > 0) {
        // Get existing files from database
        const { data: existingFiles } = await supabase
          .from('patient_files')
          .select('file_name, file_category')
          .eq('patient_id', patientData.id);

        const existingFileKeys = new Set(
          (existingFiles || []).map(f => `${f.file_category}-${f.file_name}`)
        );

        // Insert only new files
        const newFiles = allFiles
          .filter(f => !existingFileKeys.has(`${f.category}-${f.name}`))
          .map(f => {
            // Extract file path from public URL
            const urlParts = f.dataUrl.split('/');
            const pathIndex = urlParts.findIndex(part => part === 'patient-files');
            const filePath = pathIndex !== -1 ? urlParts.slice(pathIndex + 1).join('/') : '';

            return {
              patient_id: patientData.id,
              file_category: f.category,
              file_name: f.name,
              file_path: filePath,
              file_size: f.size,
              mime_type: f.type,
            };
          })
          .filter(f => f.file_path); // Only insert files with valid paths

        if (newFiles.length > 0) {
          const { error: filesError } = await supabase
            .from('patient_files')
            .insert(newFiles);

        if (filesError) throw filesError;
        }
      }

      // Save payments
      if (record.payments && record.payments.length > 0) {
        // Delete existing payments for this patient
        await supabase
          .from('payments')
          .delete()
          .eq('patient_id', patientData.id);

        // Insert new payments
        const { error: paymentsError } = await supabase
          .from('payments')
          .insert(
            record.payments.map(payment => ({
              patient_id: patientData.id,
              amount: payment.amount,
              payment_method: payment.method,
              paid_at: payment.paidAt,
              notes: payment.notes,
            }))
          );

        if (paymentsError) throw paymentsError;
      }

      await loadPatients();
      return patientData.id;
    } catch (error) {
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