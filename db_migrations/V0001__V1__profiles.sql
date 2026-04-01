CREATE TABLE IF NOT EXISTS t_p71846043_telegram_clone_proje.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#5288c1',
  avatar_initials TEXT NOT NULL DEFAULT '??',
  bio TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  public_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
