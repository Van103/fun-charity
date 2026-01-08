-- Create storage bucket for angel documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('angel-documents', 'angel-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for angel-documents bucket
CREATE POLICY "Admin can upload angel documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'angel-documents' 
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admin can view angel documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'angel-documents' 
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admin can delete angel documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'angel-documents' 
  AND public.is_admin(auth.uid())
);

-- Add new columns to angel_knowledge table
ALTER TABLE public.angel_knowledge 
ADD COLUMN IF NOT EXISTS source_file_url TEXT,
ADD COLUMN IF NOT EXISTS source_file_name TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_chunks INTEGER DEFAULT 1;