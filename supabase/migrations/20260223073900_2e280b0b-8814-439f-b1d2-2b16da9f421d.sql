
-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Users can view their own appointments
CREATE POLICY "Users can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own appointments
CREATE POLICY "Users can create own appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own appointments
CREATE POLICY "Users can update own appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own appointments
CREATE POLICY "Users can delete own appointments"
ON public.appointments FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
