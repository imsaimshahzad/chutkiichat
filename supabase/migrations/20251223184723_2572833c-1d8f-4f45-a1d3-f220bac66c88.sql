-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL REFERENCES public.sessions(code) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Public access policies (anonymous chat - anyone can read/write)
CREATE POLICY "Anyone can create sessions"
ON public.sessions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view sessions"
ON public.sessions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can create messages"
ON public.messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.messages FOR SELECT
TO anon, authenticated
USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Set replica identity for realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;