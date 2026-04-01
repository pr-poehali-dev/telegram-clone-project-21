import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not set. Running in demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
    db: {
      schema: 't_p71846043_telegram_clone_proje',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export type Database = {
  t_p71846043_telegram_clone_proje: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          username: string | null;
          display_name: string;
          avatar_color: string;
          avatar_initials: string;
          bio: string | null;
          last_seen: string;
          is_online: boolean;
          public_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['profiles']['Row']>;
      };
      chats: {
        Row: {
          id: string;
          type: 'direct' | 'group';
          name: string | null;
          avatar_color: string;
          avatar_initials: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['chats']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['chats']['Row']>;
      };
      chat_members: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          is_muted: boolean;
          is_pinned: boolean;
          last_read_at: string;
          joined_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['chat_members']['Row'], 'id' | 'joined_at'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['chat_members']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string | null;
          encrypted_text: string;
          iv: string;
          type: 'text' | 'system' | 'image';
          reply_to: string | null;
          edited_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['messages']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['messages']['Row']>;
      };
      message_reads: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['message_reads']['Row'], 'id' | 'read_at'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['message_reads']['Row']>;
      };
      chat_keys: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          encrypted_key: string;
          created_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['chat_keys']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['chat_keys']['Row']>;
      };
      typing_status: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          updated_at: string;
        };
        Insert: Omit<Database['t_p71846043_telegram_clone_proje']['Tables']['typing_status']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['t_p71846043_telegram_clone_proje']['Tables']['typing_status']['Row']>;
      };
    };
  };
};
