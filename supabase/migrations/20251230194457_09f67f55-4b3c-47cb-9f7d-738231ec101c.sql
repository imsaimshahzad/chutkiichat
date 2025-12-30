-- Allow senders to delete their own messages
CREATE POLICY "Senders can delete own messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Allow participants to delete all messages in a conversation (for clear chat)
CREATE POLICY "Participants can delete messages in conversation" 
ON public.chat_messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM conversation_participants 
  WHERE conversation_participants.conversation_id = chat_messages.conversation_id 
  AND conversation_participants.user_id = auth.uid()
));

-- Allow participants to delete conversations
CREATE POLICY "Participants can delete conversations" 
ON public.conversations 
FOR DELETE 
USING (is_conversation_participant(id, auth.uid()));

-- Allow participants to update their participation (for last_read_at)
CREATE POLICY "Participants can update own participation" 
ON public.conversation_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blocked_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Policies for blocked_users
CREATE POLICY "Users can view own blocks" 
ON public.blocked_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can block others" 
ON public.blocked_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unblock" 
ON public.blocked_users 
FOR DELETE 
USING (auth.uid() = user_id);