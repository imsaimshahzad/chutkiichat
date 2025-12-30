-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Participants can view participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

-- Create a security definer function to check if user is participant (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Participants can view participants"
ON public.conversation_participants
FOR SELECT
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Participants can view conversations"
ON public.conversations
FOR SELECT
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Participants can update conversations"
ON public.conversations
FOR UPDATE
USING (public.is_conversation_participant(id, auth.uid()));