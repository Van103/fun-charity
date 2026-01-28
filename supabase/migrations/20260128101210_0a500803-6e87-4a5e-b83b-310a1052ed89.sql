-- Migration: Add group member roles to conversation_participants
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
ADD COLUMN IF NOT EXISTS added_by UUID,
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Migration: Add group settings to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "only_admins_can_add_members": false,
  "only_admins_can_edit": false,
  "require_approval": false
}'::jsonb;

-- Migration: Create admin_sessions table for 2FA tracking
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  session_expires_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can only read their own sessions
CREATE POLICY "Admins can read own sessions" ON admin_sessions
  FOR SELECT TO authenticated
  USING (admin_id = auth.uid());

-- Policy: Admins can insert their own sessions  
CREATE POLICY "Admins can insert own sessions" ON admin_sessions
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Policy: Admins can update their own sessions
CREATE POLICY "Admins can update own sessions" ON admin_sessions
  FOR UPDATE TO authenticated
  USING (admin_id = auth.uid());

-- Create user_security_settings table if not exists
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT false,
  pin_hash TEXT,
  biometric_enabled BOOLEAN DEFAULT false,
  withdrawal_limit NUMERIC DEFAULT 500000,
  transaction_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_security_settings
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own security settings
CREATE POLICY "Users can read own security settings" ON user_security_settings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own security settings
CREATE POLICY "Users can insert own security settings" ON user_security_settings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own security settings
CREATE POLICY "Users can update own security settings" ON user_security_settings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(session_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);