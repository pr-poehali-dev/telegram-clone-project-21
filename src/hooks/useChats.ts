import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { decryptMessage, loadKey, getOrCreateKey } from '@/lib/crypto';

// ── Типы ─────────────────────────────────────────────────────────────────────

export interface ChatWithMeta {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar_color: string;
  avatar_initials: string;
  description: string | null;
  last_message: string;
  last_message_at: string | null;
  unread_count: number;
  is_muted: boolean;
  is_pinned: boolean;
  is_online: boolean;
  member_count: number;
  other_user_id: string | null;
}

// ── Хук ───────────────────────────────────────────────────────────────────────

export function useChats() {
  const { profile, isSupabaseReady } = useAuth();
  const [chats, setChats] = useState<ChatWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchChats = useCallback(async () => {
    if (!profile || !isSupabaseReady) {
      setLoading(false);
      return;
    }

    // Получаем чаты, в которых участвует пользователь
    const { data: memberRows } = await supabase
      .from('chat_members')
      .select('chat_id, is_muted, is_pinned, last_read_at')
      .eq('user_id', profile.id);

    if (!memberRows?.length) {
      setChats([]);
      setLoading(false);
      return;
    }

    const chatIds = memberRows.map(r => r.chat_id);

    const [chatsRes, allMembersRes] = await Promise.all([
      supabase.from('chats').select('*').in('id', chatIds),
      supabase.from('chat_members').select('chat_id, user_id').in('chat_id', chatIds),
    ]);

    const chatsRaw = chatsRes.data || [];
    const allMembers = allMembersRes.data || [];

    // Получаем профили всех участников
    const otherUserIds = [...new Set(
      allMembers
        .filter(m => m.user_id !== profile.id)
        .map(m => m.user_id)
    )];

    const { data: profilesData } = otherUserIds.length
      ? await supabase.from('profiles').select('id, display_name, avatar_color, avatar_initials, is_online, last_seen').in('id', otherUserIds)
      : { data: [] };

    const profilesMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]));

    // Последние сообщения для каждого чата
    const lastMsgPromises = chatIds.map(chatId =>
      supabase
        .from('messages')
        .select('id, encrypted_text, iv, created_at, sender_id, type')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    );
    const lastMsgs = await Promise.all(lastMsgPromises);

    // Количество непрочитанных
    const unreadPromises = memberRows.map(row =>
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('chat_id', row.chat_id)
        .neq('sender_id', profile.id)
        .gt('created_at', row.last_read_at)
    );
    const unreadCounts = await Promise.all(unreadPromises);

    const result: ChatWithMeta[] = await Promise.all(chatsRaw.map(async (chat, idx) => {
      const memberRow = memberRows.find(r => r.chat_id === chat.id)!;
      const chatMembers = allMembers.filter(m => m.chat_id === chat.id);
      const otherUser = chatMembers.find(m => m.user_id !== profile.id);
      const otherProfile = otherUser ? profilesMap[otherUser.user_id] : null;

      const lastMsgData = lastMsgs[idx].data;
      let lastMessage = '';
      if (lastMsgData) {
        if (lastMsgData.type === 'system') {
          lastMessage = lastMsgData.encrypted_text;
        } else {
          const key = await loadKey(chat.id);
          if (key && lastMsgData.encrypted_text && lastMsgData.iv) {
            try {
              lastMessage = await decryptMessage(lastMsgData.encrypted_text, lastMsgData.iv, key);
            } catch {
              lastMessage = '🔒 Сообщение';
            }
          } else {
            lastMessage = '🔒 Сообщение';
          }
        }
      }

      const name = chat.type === 'direct' && otherProfile
        ? otherProfile.display_name
        : (chat.name || 'Группа');

      const avatarColor = chat.type === 'direct' && otherProfile
        ? otherProfile.avatar_color
        : chat.avatar_color;

      const avatarInitials = chat.type === 'direct' && otherProfile
        ? otherProfile.avatar_initials
        : chat.avatar_initials;

      return {
        id: chat.id,
        type: chat.type as 'direct' | 'group',
        name,
        avatar_color: avatarColor,
        avatar_initials: avatarInitials,
        description: chat.description,
        last_message: lastMessage,
        last_message_at: lastMsgData?.created_at || chat.created_at,
        unread_count: unreadCounts[idx].count || 0,
        is_muted: memberRow.is_muted,
        is_pinned: memberRow.is_pinned,
        is_online: chat.type === 'direct' ? (otherProfile?.is_online || false) : false,
        member_count: chatMembers.length,
        other_user_id: otherProfile?.id || null,
      };
    }));

    // Сортировка: закреплённые сверху, потом по дате
    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
    });

    setChats(result);
    setLoading(false);
  }, [profile, isSupabaseReady]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Реалтайм подписка на новые сообщения (обновляем список чатов)
  useEffect(() => {
    if (!profile || !isSupabaseReady) return;

    channelRef.current = supabase
      .channel(`chats-list-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 't_p71846043_telegram_clone_proje',
        table: 'messages',
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 't_p71846043_telegram_clone_proje',
        table: 'chat_members',
        filter: `user_id=eq.${profile.id}`,
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 't_p71846043_telegram_clone_proje',
        table: 'chat_members',
        filter: `user_id=eq.${profile.id}`,
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [profile, isSupabaseReady, fetchChats]);

  // Создать новый чат (1-на-1) или найти существующий
  const startDirectChat = useCallback(async (targetPhone: string): Promise<string | null> => {
    if (!profile || !isSupabaseReady) return null;

    // Найти пользователя по телефону
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', targetPhone)
      .maybeSingle();

    if (!targetUser) return null;

    // Проверить, нет ли уже чата
    const { data: existingMemberships } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', profile.id);

    if (existingMemberships?.length) {
      const chatIds = existingMemberships.map(m => m.chat_id);
      const { data: sharedChats } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', targetUser.id)
        .in('chat_id', chatIds);

      if (sharedChats?.length) {
        // Проверить что это direct чат
        const { data: directChat } = await supabase
          .from('chats')
          .select('id')
          .eq('type', 'direct')
          .in('id', sharedChats.map(c => c.chat_id))
          .maybeSingle();

        if (directChat) return directChat.id;
      }
    }

    // Создать новый чат
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ type: 'direct', created_by: profile.id })
      .select()
      .single();

    if (error || !newChat) return null;

    // Добавить обоих участников
    await supabase.from('chat_members').insert([
      { chat_id: newChat.id, user_id: profile.id, role: 'member' },
      { chat_id: newChat.id, user_id: targetUser.id, role: 'member' },
    ]);

    // Сгенерировать и сохранить ключ
    await getOrCreateKey(newChat.id);

    await fetchChats();
    return newChat.id;
  }, [profile, isSupabaseReady, fetchChats]);

  const togglePin = useCallback(async (chatId: string, isPinned: boolean) => {
    if (!profile) return;
    await supabase
      .from('chat_members')
      .update({ is_pinned: !isPinned })
      .eq('chat_id', chatId)
      .eq('user_id', profile.id);
    await fetchChats();
  }, [profile, fetchChats]);

  const toggleMute = useCallback(async (chatId: string, isMuted: boolean) => {
    if (!profile) return;
    await supabase
      .from('chat_members')
      .update({ is_muted: !isMuted })
      .eq('chat_id', chatId)
      .eq('user_id', profile.id);
    await fetchChats();
  }, [profile, fetchChats]);

  return { chats, loading, fetchChats, startDirectChat, togglePin, toggleMute };
}
