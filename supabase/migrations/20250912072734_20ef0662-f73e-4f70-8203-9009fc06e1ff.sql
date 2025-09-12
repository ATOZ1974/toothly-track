-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  practice_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  date_of_birth DATE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dental_records table for tooth states and notes
CREATE TABLE public.dental_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tooth_states JSONB DEFAULT '{}',
  chief_complaint TEXT,
  clinical_notes TEXT,
  treatment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dental_record_id UUID NOT NULL REFERENCES public.dental_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tooth_number INTEGER,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_files table for document management
CREATE TABLE public.patient_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_category TEXT NOT NULL CHECK (file_category IN ('personal', 'diagnostics', 'treatment', 'xrays')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for patients
CREATE POLICY "Users can view their own patients" 
ON public.patients FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patients" 
ON public.patients FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" 
ON public.patients FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients" 
ON public.patients FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for dental_records
CREATE POLICY "Users can view their patients' dental records" 
ON public.dental_records FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = dental_records.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create dental records for their patients" 
ON public.dental_records FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = dental_records.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update their patients' dental records" 
ON public.dental_records FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = dental_records.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete their patients' dental records" 
ON public.dental_records FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = dental_records.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create RLS policies for treatments
CREATE POLICY "Users can view treatments for their patients" 
ON public.treatments FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.dental_records dr
  JOIN public.patients p ON p.id = dr.patient_id
  WHERE dr.id = treatments.dental_record_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can create treatments for their patients" 
ON public.treatments FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.dental_records dr
  JOIN public.patients p ON p.id = dr.patient_id
  WHERE dr.id = treatments.dental_record_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can update treatments for their patients" 
ON public.treatments FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.dental_records dr
  JOIN public.patients p ON p.id = dr.patient_id
  WHERE dr.id = treatments.dental_record_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Users can delete treatments for their patients" 
ON public.treatments FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.dental_records dr
  JOIN public.patients p ON p.id = dr.patient_id
  WHERE dr.id = treatments.dental_record_id 
  AND p.user_id = auth.uid()
));

-- Create RLS policies for patient_files
CREATE POLICY "Users can view files for their patients" 
ON public.patient_files FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_files.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can upload files for their patients" 
ON public.patient_files FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_files.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete files for their patients" 
ON public.patient_files FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_files.patient_id 
  AND patients.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dental_records_updated_at
  BEFORE UPDATE ON public.dental_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for patient files
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-files', 'patient-files', false);

-- Create storage policies
CREATE POLICY "Users can view their own patient files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own patient files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own patient files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own patient files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);