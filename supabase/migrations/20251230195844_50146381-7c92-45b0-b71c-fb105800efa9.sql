-- Create starred_messages table
CREATE TABLE public.starred_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Enable RLS
ALTER TABLE public.starred_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own starred messages
CREATE POLICY "Users can view own starred messages"
ON public.starred_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can star messages
CREATE POLICY "Users can star messages"
ON public.starred_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unstar messages
CREATE POLICY "Users can unstar messages"
ON public.starred_messages
FOR DELETE
USING (auth.uid() = user_id);