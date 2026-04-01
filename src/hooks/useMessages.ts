import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { encryptMessage, decryptMessage, getOrCreateKey } from '@/lib/crypto';

// ── Типы ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string | null;
  text: string; // расшифрованный текст
  encrypted_text: string;
  iv: string;
  type: 'text' | 'system' | 'image';
  reply_to: string | null;
  edited_at: string | null;
  created_at: string;
  isOwn: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  senderName?: string;
  senderColor?: string;
  senderInitials?: string;
}

// ── Хук ───────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

export function useMessages(chatId: string | null) {
  const { profile, isSupabaseReady } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profilesCacheRef = useRef<Map<string, { name: string; color: string; initials: string }>>(new Map());

  const getProfile = useCallback(async (userId: string) => {
    const cached = profilesCacheRef.current.get(userId);
    if (cached) return cached;
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_color, avatar_initials')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      const prof = { name: data.display_name, color: data.avatar_color, initials: data.avatar_initials };
      profilesCacheRef.current.set(userId, prof);
      return prof;
    }
    return null;
  }, []);

  const decryptAndBuild = useCallback(async (
    row: {
      id: string; chat_id: string; sender_id: string | null;
      encrypted_text: string; iv: string;
      type: string; reply_to: string | null;
      edited_at: string | null; created_at: string;
    }
  ): Promise<Message> => {
    const key = await getOrCreateKey(row.chat_id);
    let text = row.encrypted_text;
    if (row.type !== 'system') {
      text = await decryptMessage(row.encrypted_text, row.iv, key);
    }

    let senderName: string | undefined;
    let senderColor: string | undefined;
    let senderInitials: string | undefined;
    if (row.sender_id && row.sender_id !== profile?.id) {
      const prof = await getProfile(row.sender_id);
      if (prof) {
        senderName = prof.name;
        senderColor = prof.color;
        senderInitials = prof.initials;
      }
    }

    return {
      id: row.id,
      chat_id: row.chat_id,
      sender_id: row.sender_id,
      text,
      encrypted_text: row.encrypted_text,
      iv: row.iv,
      type: row.type as 'text' | 'system' | 'image',
      reply_to: row.reply_to,
      edited_at: row.edited_at,
      created_at: row.created_at,
      isOwn: row.sender_id === profile?.id,
      status: 'read',
      senderName,
      senderColor,
      senderInitials,
    };
  }, [profile?.id, getProfile]);

  // Загрузка сообщений
  const fetchMessages = useCallback(async (before?: string) => {
    if (!chatId || !profile || !isSupabaseReady) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data } = await query;
    const rows = (data || []).reverse();

    const built = await Promise.all(rows.map(decryptAndBuild));

    if (before) {
      setMessages(prev => [...built, ...prev]);
    } else {
      setMessages(built);
    }
    setHasMore(rows.length === PAGE_SIZE);

    // Пометить сообщения как прочитанные
    const unreadIds = rows
      .filter(r => r.sender_id !== profile.id && r.type !== 'system')
      .map(r => r.id);

    if (unreadIds.length) {
      const inserts = unreadIds.map(id => ({ message_id: id, user_id: profile.id }));
      await supabase.from('message_reads').upsert(inserts, { onConflict: 'message_id,user_id', ignoreDuplicates: true });
    }

    // Обновить last_read_at
    await supabase
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', profile.id);

    setLoading(false);
  }, [chatId, profile, isSupabaseReady, decryptAndBuild]);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchMessages();
  }, [chatId, fetchMessages]);

  // Реалтайм: новые сообщения + typing
  useEffect(() => {
    if (!chatId || !profile || !isSupabaseReady) return;

    channelRef.current?.unsubscribe();

    channelRef.current = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 't_p71846043_telegram_clone_proje',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, async (payload) => {
        const row = payload.new as Parameters<typeof decryptAndBuild>[0];
        const msg = await decryptAndBuild(row);
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Пометить прочитанным
        if (msg.sender_id !== profile.id && msg.type !== 'system') {
          await supabase.from('message_reads').upsert(
            [{ message_id: msg.id, user_id: profile.id }],
            { onConflict: 'message_id,user_id', ignoreDuplicates: true }
          );
          await supabase
            .from('chat_members')
            .update({ last_read_at: new Date().toISOString() })
            .eq('chat_id', chatId)
            .eq('user_id', profile.id);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 't_p71846043_telegram_clone_proje',
        table: 'typing_status',
        filter: `chat_id=eq.${chatId}`,
      }, async () => {
        const { data } = await supabase
          .from('typing_status')
          .select('user_id, updated_at')
          .eq('chat_id', chatId)
          .neq('user_id', profile.id);

        const recent = (data || []).filter(r => {
          const diff = Date.now() - new Date(r.updated_at).getTime();
          return diff < 5000;
        });

        const ids = recent.map(r => r.user_id);
        const names = await Promise.all(ids.map(async id => {
          const prof = await getProfile(id);
          return prof?.name || 'Кто-то';
        }));
        setTypingUsers(names);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 't_p71846043_telegram_clone_proje',
        table: 'typing_status',
        filter: `chat_id=eq.${chatId}`,
      }, async () => {
        const { data } = await supabase
          .from('typing_status')
          .select('user_id, updated_at')
          .eq('chat_id', chatId)
          .neq('user_id', profile.id);

        const recent = (data || []).filter(r => {
          const diff = Date.now() - new Date(r.updated_at).getTime();
          return diff < 5000;
        });

        const ids = recent.map(r => r.user_id);
        const names = await Promise.all(ids.map(async id => {
          const prof = await getProfile(id);
          return prof?.name || 'Кто-то';
        }));
        setTypingUsers(names);
      })
      .subscribe();

    // Очищать typing через 5 сек
    const typingClearInterval = setInterval(() => {
      setTypingUsers(prev => (prev.length ? [] : prev));
    }, 5000);

    return () => {
      channelRef.current?.unsubscribe();
      clearInterval(typingClearInterval);
    };
  }, [chatId, profile, isSupabaseReady, decryptAndBuild, getProfile]);

  // Отправить сообщение
  const sendMessage = useCallback(async (text: string, replyTo?: string) => {
    if (!chatId || !profile || !text.trim() || !isSupabaseReady) return;

    const key = await getOrCreateKey(chatId);
    const { ciphertext, iv } = await encryptMessage(text.trim(), key);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      chat_id: chatId,
      sender_id: profile.id,
      text: text.trim(),
      encrypted_text: ciphertext,
      iv,
      type: 'text',
      reply_to: replyTo || null,
      edited_at: null,
      created_at: new Date().toISOString(),
      isOwn: true,
      status: 'sending',
    };

    setMessages(prev => [...prev, tempMsg]);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: profile.id,
        encrypted_text: ciphertext,
        iv,
        type: 'text',
        reply_to: replyTo || null,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId
            ? { ...m, id: data.id, status: 'sent' as const, created_at: data.created_at }
            : m
        )
      );
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }

    // Сбросить typing
    await supabase
      .from('typing_status')
      .update({ updated_at: new Date(0).toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', profile.id);
  }, [chatId, profile, isSupabaseReady]);

  // Печатает...
  const sendTyping = useCallback(async () => {
    if (!chatId || !profile || !isSupabaseReady) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    await supabase.from('typing_status').upsert(
      { chat_id: chatId, user_id: profile.id, updated_at: new Date().toISOString() },
      { onConflict: 'chat_id,user_id' }
    );

    typingTimerRef.current = setTimeout(async () => {
      await supabase
        .from('typing_status')
        .update({ updated_at: new Date(0).toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', profile.id);
    }, 4000);
  }, [chatId, profile, isSupabaseReady]);

  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore) {
      fetchMessages(messages[0].created_at);
    }
  }, [messages, hasMore, fetchMessages]);

  return { messages, loading, hasMore, typingUsers, sendMessage, sendTyping, loadMore };
}
