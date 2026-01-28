-- ============================================
-- PHASE 0+ FUN CHAT DATABASE MIGRATION
-- ============================================

-- PART 1: EDIT MESSAGE - Add columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS original_content TEXT;

-- PART 2: CHARITY GLOBAL HUB

-- Charity Channels (Public channels for global charity)
CREATE TABLE IF NOT EXISTS public.charity_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT CHECK (category IN ('education', 'health', 'environment', 'community', 'disaster', 'children')),
  member_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Members
CREATE TABLE IF NOT EXISTS public.charity_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.charity_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Channel Messages
CREATE TABLE IF NOT EXISTS public.charity_channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.charity_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deeds (Good deeds - Lan Tỏa Ánh Sáng)
CREATE TABLE IF NOT EXISTS public.deeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  category TEXT CHECK (category IN ('helping', 'donation', 'volunteer', 'kindness', 'environment', 'other')),
  location TEXT,
  light_points INTEGER DEFAULT 10,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deed Reactions
CREATE TABLE IF NOT EXISTS public.deed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deed_id UUID REFERENCES public.deeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'heart' CHECK (reaction_type IN ('heart', 'star', 'pray', 'inspire', 'grateful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deed_id, user_id)
);

-- Deed Comments
CREATE TABLE IF NOT EXISTS public.deed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deed_id UUID REFERENCES public.deeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Light Points
CREATE TABLE IF NOT EXISTS public.user_light_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  deeds_count INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Beginner',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PART 3: STORIES

-- Stories table
CREATE TABLE IF NOT EXISTS public.chat_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  background_color TEXT,
  text_overlay TEXT,
  text_position JSONB,
  duration INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Views
CREATE TABLE IF NOT EXISTS public.chat_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.chat_stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Story Reactions
CREATE TABLE IF NOT EXISTS public.chat_story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.chat_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'heart',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Charity Channels RLS
ALTER TABLE public.charity_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active channels" ON public.charity_channels FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create channels" ON public.charity_channels FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Channel creators can update" ON public.charity_channels FOR UPDATE USING (auth.uid() = created_by);

-- Channel Members RLS
ALTER TABLE public.charity_channel_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view channel members" ON public.charity_channel_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join channels" ON public.charity_channel_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave channels" ON public.charity_channel_members FOR DELETE USING (auth.uid() = user_id);

-- Channel Messages RLS
ALTER TABLE public.charity_channel_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view channel messages" ON public.charity_channel_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.charity_channel_members WHERE channel_id = charity_channel_messages.channel_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.charity_channels WHERE id = charity_channel_messages.channel_id AND is_official = true)
);
CREATE POLICY "Members can send messages" ON public.charity_channel_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.charity_channel_members WHERE channel_id = charity_channel_messages.channel_id AND user_id = auth.uid())
);

-- Deeds RLS
ALTER TABLE public.deeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public deeds" ON public.deeds FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
CREATE POLICY "Users can create own deeds" ON public.deeds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deeds" ON public.deeds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deeds" ON public.deeds FOR DELETE USING (auth.uid() = user_id);

-- Deed Reactions RLS
ALTER TABLE public.deed_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view deed reactions" ON public.deed_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.deed_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.deed_reactions FOR DELETE USING (auth.uid() = user_id);

-- Deed Comments RLS
ALTER TABLE public.deed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view deed comments" ON public.deed_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.deed_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.deed_comments FOR DELETE USING (auth.uid() = user_id);

-- User Light Points RLS
ALTER TABLE public.user_light_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view light points" ON public.user_light_points FOR SELECT USING (true);
CREATE POLICY "Users can update own points" ON public.user_light_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert points" ON public.user_light_points FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stories RLS
ALTER TABLE public.chat_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view non-expired stories" ON public.chat_stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can create own stories" ON public.chat_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON public.chat_stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON public.chat_stories FOR DELETE USING (auth.uid() = user_id);

-- Story Views RLS
ALTER TABLE public.chat_story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Story owners can view their story views" ON public.chat_story_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_stories WHERE id = chat_story_views.story_id AND user_id = auth.uid())
);
CREATE POLICY "Users can record story views" ON public.chat_story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Story Reactions RLS
ALTER TABLE public.chat_story_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view story reactions" ON public.chat_story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react to stories" ON public.chat_story_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.chat_story_reactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- REALTIME & INDEXES
-- ============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.charity_channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deeds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deed_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_stories;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deeds_user_id ON public.deeds(user_id);
CREATE INDEX IF NOT EXISTS idx_deeds_visibility ON public.deeds(visibility);
CREATE INDEX IF NOT EXISTS idx_deeds_created_at ON public.deeds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_stories_expires_at ON public.chat_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_stories_user_id ON public.chat_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_charity_channels_category ON public.charity_channels(category);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update light points when deed is created
CREATE OR REPLACE FUNCTION public.update_light_points_on_deed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_light_points (user_id, total_points, weekly_points, monthly_points, deeds_count)
  VALUES (NEW.user_id, NEW.light_points, NEW.light_points, NEW.light_points, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = user_light_points.total_points + NEW.light_points,
    weekly_points = user_light_points.weekly_points + NEW.light_points,
    monthly_points = user_light_points.monthly_points + NEW.light_points,
    deeds_count = user_light_points.deeds_count + 1,
    rank = CASE 
      WHEN user_light_points.total_points + NEW.light_points >= 10000 THEN 'Legend'
      WHEN user_light_points.total_points + NEW.light_points >= 5000 THEN 'Champion'
      WHEN user_light_points.total_points + NEW.light_points >= 1000 THEN 'Hero'
      WHEN user_light_points.total_points + NEW.light_points >= 100 THEN 'Helper'
      ELSE 'Beginner'
    END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for light points
DROP TRIGGER IF EXISTS trigger_update_light_points ON public.deeds;
CREATE TRIGGER trigger_update_light_points
  AFTER INSERT ON public.deeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_light_points_on_deed();

-- Function to update channel member count
CREATE OR REPLACE FUNCTION public.update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.charity_channels SET member_count = member_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.charity_channels SET member_count = member_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for member count
DROP TRIGGER IF EXISTS trigger_update_member_count ON public.charity_channel_members;
CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON public.charity_channel_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_channel_member_count();

-- Function to cleanup expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM public.chat_stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;