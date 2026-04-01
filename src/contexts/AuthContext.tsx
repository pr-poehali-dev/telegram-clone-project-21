import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Типы ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  phone: string;
  username: string | null;
  display_name: string;
  avatar_color: string;
  avatar_initials: string;
  bio: string | null;
  is_online: boolean;
  public_key: string | null;
}

interface AuthContextValue {
  profile: UserProfile | null;
  loading: boolean;
  isSupabaseReady: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// ── Контекст ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// ── Генерация цвета аватара ───────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#e17076', '#a695e7', '#6fb9f0', '#f6c44f',
  '#5ca9e8', '#ee7aae', '#4daf4e', '#ff7043',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '??';
}

// ── Провайдер ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isSupabaseReady =
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

  // Загрузить профиль из БД
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  }, []);

  // Создать профиль если не существует
  const ensureProfile = useCallback(async (userId: string, phone: string) => {
    let prof = await fetchProfile(userId);
    if (!prof) {
      const displayName = phone.replace(/^\+/, '');
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          phone,
          display_name: displayName,
          avatar_color: getAvatarColor(userId),
          avatar_initials: getInitials(displayName),
          is_online: true,
        })
        .select()
        .single();

      if (!error && data) prof = data as UserProfile;
    } else {
      // Обновить онлайн-статус
      await supabase
        .from('profiles')
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq('id', userId);
    }
    return prof;
  }, [fetchProfile]);

  // Инициализация сессии
  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const prof = await ensureProfile(session.user.id, session.user.phone || '');
        setProfile(prof);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const prof = await ensureProfile(session.user.id, session.user.phone || '');
        setProfile(prof);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseReady, ensureProfile]);

  // Онлайн-статус (heartbeat каждые 30 сек)
  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq('id', profile.id);
    }, 30_000);

    // Офлайн при закрытии вкладки
    const handleUnload = () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`,
        JSON.stringify({ is_online: false })
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [profile]);

  const signInWithPhone = async (phone: string): Promise<{ error: string | null }> => {
    if (!isSupabaseReady) return { error: 'Supabase не настроен. Добавьте ключи.' };
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return { error: error.message };
    return { error: null };
  };

  const verifyOtp = async (phone: string, token: string): Promise<{ error: string | null }> => {
    if (!isSupabaseReady) return { error: 'Supabase не настроен.' };
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    if (profile) {
      await supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', profile.id);
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updates: Partial<UserProfile> & { updated_at?: string } = { ...data, updated_at: new Date().toISOString() };
    if (data.display_name) {
      updates.avatar_initials = getInitials(data.display_name);
    }
    await supabase.from('profiles').update(updates).eq('id', profile.id);
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      profile,
      loading,
      isSupabaseReady,
      signInWithPhone,
      verifyOtp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
