-- Ensure each patient has at most one dental record so ON CONFLICT (patient_id) works
ALTER TABLE public.dental_records
ADD CONSTRAINT dental_records_patient_id_unique UNIQUE (patient_id);