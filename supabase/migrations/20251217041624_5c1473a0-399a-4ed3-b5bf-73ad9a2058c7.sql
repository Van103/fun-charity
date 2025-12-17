-- Create a PRIVATE storage bucket for KYC documents (identity documents, business licenses)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- RLS: Users can view their own KYC documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can upload their own KYC documents  
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can update their own KYC documents
CREATE POLICY "Users can update own KYC documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Admins can view all KYC documents (for verification)
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND public.is_admin(auth.uid())
);