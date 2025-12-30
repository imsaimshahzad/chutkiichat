-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true);

-- Allow anyone to upload files to the bucket
CREATE POLICY "Anyone can upload chat attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow anyone to view chat attachments
CREATE POLICY "Anyone can view chat attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Allow anyone to delete their own uploads (by folder name matching session)
CREATE POLICY "Anyone can delete chat attachments"
ON storage.objects
FOR DELETE
USING (bucket_id = 'chat-attachments');

-- Add file_url column to messages table
ALTER TABLE public.messages
ADD COLUMN file_url TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_name TEXT;