-- Drop and recreate the INSERT policy for conversations to ensure it works
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

-- Create a proper INSERT policy that allows authenticated users to create conversations
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (created_by IS NULL OR created_by = auth.uid()));