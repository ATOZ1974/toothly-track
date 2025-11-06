-- Make storage buckets private for security
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('patient-files', 'avatars');

-- Add file size validation (only if file_size is set)
ALTER TABLE patient_files
ADD CONSTRAINT check_file_size CHECK (file_size IS NULL OR (file_size > 0 AND file_size <= 10485760));

-- Add validation constraints for patient data
ALTER TABLE patients
ADD CONSTRAINT check_name_length CHECK (length(name) > 0 AND length(name) <= 200),
ADD CONSTRAINT check_phone_length CHECK (phone IS NULL OR length(phone) <= 20),
ADD CONSTRAINT check_age_range CHECK (age IS NULL OR (age >= 0 AND age <= 150));

-- Add validation for payments
ALTER TABLE payments
ADD CONSTRAINT check_payment_amount CHECK (amount > 0 AND amount <= 999999999),
ADD CONSTRAINT check_payment_method CHECK (payment_method IN ('cash', 'card', 'upi', 'insurance', 'other'));

-- Add validation for clinical notes (max length)
ALTER TABLE dental_records
ADD CONSTRAINT check_chief_complaint_length CHECK (chief_complaint IS NULL OR length(chief_complaint) <= 5000),
ADD CONSTRAINT check_clinical_notes_length CHECK (clinical_notes IS NULL OR length(clinical_notes) <= 10000),
ADD CONSTRAINT check_treatment_notes_length CHECK (treatment_notes IS NULL OR length(treatment_notes) <= 10000);