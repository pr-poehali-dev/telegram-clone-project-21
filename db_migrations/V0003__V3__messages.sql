CREATE TABLE IF NOT EXISTS t_p71846043_telegram_clone_proje.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender_id UUID,
  encrypted_text TEXT NOT NULL,
  iv TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  reply_to UUID,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p71846043_telegram_clone_proje.messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON t_p71846043_telegram_clone_proje.messages(sender_id);
