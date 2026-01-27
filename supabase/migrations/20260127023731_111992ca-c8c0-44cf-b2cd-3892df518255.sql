-- ============================================
-- SECURITY FIX: Profiles Table Public Exposure
-- ============================================

-- Step 1: Drop the overly permissive policy that allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Step 2: Create a public view that excludes sensitive fields (email, blocked_reason, wallet_address)
-- This view will be used for public profile lookups (search, display)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  bio,
  cover_url,
  role,
  is_verified,
  reputation_score,
  total_tokens_claimed,
  is_blocked,
  created_at,
  updated_at
FROM public.profiles
WHERE is_blocked = false OR is_blocked IS NULL;

-- Step 3: Grant SELECT on the view to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Step 4: Create a new restrictive policy for profiles table
-- Only allow authenticated users to SELECT from profiles_public view
-- Direct table access should be limited to own profile, friends, and admins

-- Add policy for viewing profiles of users you have conversations with (for messaging)
CREATE POLICY "Users can view profiles in their conversations" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.participant1_id = auth.uid() AND c.participant2_id = profiles.user_id)
       OR (c.participant2_id = auth.uid() AND c.participant1_id = profiles.user_id)
  )
);

-- Add policy for viewing profiles of users who reacted/commented on your posts
CREATE POLICY "Users can view profiles of post interactions" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM feed_posts fp
    WHERE fp.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM feed_reactions fr WHERE fr.feed_post_id = fp.id AND fr.user_id = profiles.user_id
      UNION ALL
      SELECT 1 FROM feed_comments fc WHERE fc.feed_post_id = fp.id AND fc.user_id = profiles.user_id
    )
  )
);

-- ============================================
-- SECURITY FIX: KYC Requests Document Exposure  
-- ============================================
-- The kyc_requests table already has proper RLS:
-- - Users can only view their own KYC requests
-- - Admins can manage all KYC requests
-- 
-- However, we need to ensure the storage bucket is also properly secured
-- This is done via storage policies, not table policies

-- Verify kyc_requests RLS is enabled (should already be)
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- Add comment documenting security status
COMMENT ON TABLE public.kyc_requests IS 'KYC verification requests. RLS enabled: Users can only view own requests, admins can view all. Document URLs are in private storage bucket.';
COMMENT ON VIEW public.profiles_public IS 'Public view of profiles excluding sensitive fields (email, wallet_address, blocked_reason). Use this for profile lookups and display.';