-- Add agora_channel_name column to feed_posts for livestream
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS agora_channel_name TEXT;