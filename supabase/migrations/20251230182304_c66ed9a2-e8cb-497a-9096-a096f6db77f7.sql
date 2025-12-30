-- Add storage policies to restrict file types and size for chat-attachments bucket

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from chat-attachments" ON storage.objects;

-- Create new restrictive policies with file type and size validation

-- Allow uploads only for allowed file types and max 10MB
CREATE POLICY "Restricted uploads to chat-attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx'])) AND
  (COALESCE((metadata->>'size')::bigint, 0) <= 10485760)
);

-- Allow viewing files in chat-attachments (still public for anonymous chat)
CREATE POLICY "Public read access to chat-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Restrict delete to prevent abuse - no public delete allowed
-- Files will be cleaned up with session expiry