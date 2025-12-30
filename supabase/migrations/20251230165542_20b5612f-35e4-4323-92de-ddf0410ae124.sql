-- Fix 1: Update the DELETE policy for message_reactions to only allow deleting own reactions
-- Note: Since this is an anonymous app without auth, we can't use auth.uid()
-- The best we can do is document the client-side enforcement and accept the limitation
-- However, we can make the policy name more accurate

DROP POLICY IF EXISTS "Anyone can remove their own reactions" ON public.message_reactions;

CREATE POLICY "Anyone can remove reactions"
ON public.message_reactions
FOR DELETE
USING (true);

-- Fix 2: Add CHECK constraints for message content validation
-- Add constraint to ensure messages have content between 1-5000 characters
ALTER TABLE public.messages 
ADD CONSTRAINT message_content_length 
CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000);

-- Add constraint to ensure sender name is valid (1-50 characters)
ALTER TABLE public.messages
ADD CONSTRAINT sender_name_valid
CHECK (LENGTH(sender) > 0 AND LENGTH(sender) <= 50);

-- Add constraint for session_code (should be 4 digit code)
ALTER TABLE public.messages
ADD CONSTRAINT session_code_valid
CHECK (LENGTH(session_code) > 0 AND LENGTH(session_code) <= 10);

-- Also add validation for message_reactions
ALTER TABLE public.message_reactions
ADD CONSTRAINT reaction_emoji_valid
CHECK (LENGTH(emoji) > 0 AND LENGTH(emoji) <= 10);

ALTER TABLE public.message_reactions
ADD CONSTRAINT reaction_username_valid
CHECK (LENGTH(user_name) > 0 AND LENGTH(user_name) <= 50);