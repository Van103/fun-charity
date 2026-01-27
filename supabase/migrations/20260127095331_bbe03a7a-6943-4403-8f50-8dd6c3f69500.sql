-- Phase 2: Reply & Voice Messages
-- Add reply_to_id for message threading
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id);

-- Add audio columns for voice messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_duration INTEGER;

-- Index for performance on reply queries
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);