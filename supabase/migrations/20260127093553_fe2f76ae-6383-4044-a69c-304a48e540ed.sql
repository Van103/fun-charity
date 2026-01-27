-- Phase 1: Pin & Archive for conversations
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Chat Settings per conversation (notification, theme, nickname)
CREATE TABLE IF NOT EXISTS conversation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  nickname TEXT,
  theme_color TEXT DEFAULT '#8B5CF6',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_settings
CREATE POLICY "Users can view their own conversation settings"
  ON conversation_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation settings"
  ON conversation_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation settings"
  ON conversation_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation settings"
  ON conversation_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_conversation_settings_updated_at
  BEFORE UPDATE ON conversation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for conversation_settings
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_settings;