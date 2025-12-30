-- Add last_activity_at column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Update existing sessions to have last_activity_at based on their created_at
UPDATE public.sessions SET last_activity_at = created_at;

-- Create function to update session activity when a message is sent
CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sessions 
  SET last_activity_at = now() 
  WHERE code = NEW.session_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-update session activity on new messages
CREATE TRIGGER update_session_activity_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_session_activity();

-- Create function to delete expired sessions (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete messages from expired sessions first (due to foreign key)
  DELETE FROM public.messages 
  WHERE session_code IN (
    SELECT code FROM public.sessions 
    WHERE last_activity_at < now() - INTERVAL '24 hours'
  );
  
  -- Delete expired sessions
  DELETE FROM public.sessions 
  WHERE last_activity_at < now() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;