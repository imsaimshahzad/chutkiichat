-- Add DELETE policy for sessions table
CREATE POLICY "Anyone can delete sessions"
ON public.sessions
FOR DELETE
USING (true);

-- Add DELETE policy for messages table  
CREATE POLICY "Anyone can delete messages"
ON public.messages
FOR DELETE
USING (true);