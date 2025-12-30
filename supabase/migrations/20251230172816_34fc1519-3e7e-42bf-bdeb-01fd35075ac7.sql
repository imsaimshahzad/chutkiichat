-- Create message reads table
CREATE TABLE public.message_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  session_code TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_name)
);

-- Enable RLS
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Anyone can view reads
CREATE POLICY "Anyone can view message reads"
ON public.message_reads
FOR SELECT
USING (true);

-- Anyone can mark messages as read
CREATE POLICY "Anyone can mark messages as read"
ON public.message_reads
FOR INSERT
WITH CHECK (true);

-- Enable realtime for message_reads
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;