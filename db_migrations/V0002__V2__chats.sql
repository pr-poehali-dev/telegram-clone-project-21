CREATE TABLE IF NOT EXISTS t_p71846043_telegram_clone_proje.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct',
  name TEXT,
  avatar_color TEXT DEFAULT '#5288c1',
  avatar_initials TEXT DEFAULT '??',
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p71846043_telegram_clone_proje.chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  is_muted BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_user ON t_p71846043_telegram_clone_proje.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON t_p71846043_telegram_clone_proje.chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON t_p71846043_telegram_clone_proje.profiles(phone);
