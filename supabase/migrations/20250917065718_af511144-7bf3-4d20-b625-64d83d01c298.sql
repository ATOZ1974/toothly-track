-- Add missing UPDATE policy for patient_files table
CREATE POLICY "Users can update files for their patients" 
ON public.patient_files 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM patients
  WHERE ((patients.id = patient_files.patient_id) AND (patients.user_id = auth.uid()))
));