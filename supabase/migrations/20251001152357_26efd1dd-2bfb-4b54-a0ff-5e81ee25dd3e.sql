-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'insurance', 'other')),
  paid_at timestamp with time zone NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their patients"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = payments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their patients"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = payments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments for their patients"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = payments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments for their patients"
  ON public.payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = payments.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();