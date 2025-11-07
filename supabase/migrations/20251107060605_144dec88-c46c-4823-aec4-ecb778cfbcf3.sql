-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view appointments for their patients"
ON public.appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create appointments for their patients"
ON public.appointments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update appointments for their patients"
ON public.appointments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete appointments for their patients"
ON public.appointments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = appointments.patient_id
    AND patients.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);