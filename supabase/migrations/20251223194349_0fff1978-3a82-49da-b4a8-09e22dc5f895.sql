-- Ensure REPLICA IDENTITY is set for realtime to work properly
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.sessions REPLICA IDENTITY FULL;

-- Add sessions to realtime publication if not already there
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;