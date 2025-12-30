-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, emoji, user_name)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view reactions
CREATE POLICY "Anyone can view reactions"
ON public.message_reactions
FOR SELECT
USING (true);

-- Allow anyone to add reactions
CREATE POLICY "Anyone can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to remove their own reactions
CREATE POLICY "Anyone can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (true);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;