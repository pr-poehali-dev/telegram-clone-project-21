import { memo, useState, useCallback } from "react";
import { Search, Edit, MoreVertical, Pin, BellOff, Plus, LogOut, UserCircle, Loader2 } from "lucide-react";
import { useChats, type ChatWithMeta } from "@/hooks/useChats";
import { useAuth } from "@/contexts/AuthContext";
import { NewChatDialog } from "./NewChatDialog";
import { formatDistanceStrict, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface ChatSidebarProps {
  activeChat: string | null;
  onSelectChat: (id: string) => void;
}

// ── Форматирование времени ────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '';
  try {
    const date = parseISO(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayMs = 86400000;

    if (diff < dayMs && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 2 * dayMs) return 'вчера';
    if (diff < 7 * dayMs) {
      return formatDistanceStrict(date, now, { locale: ru, unit: 'day' }).replace(' назад', '');
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

// ── Скелетон загрузки ────────────────────────────────────────────────────────

function SkeletonChat() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-[52px] h-[52px] rounded-full bg-tg-hover flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-tg-hover rounded w-32" />
          <div className="h-3 bg-tg-hover rounded w-10" />
        </div>
        <div className="h-3 bg-tg-hover rounded w-48" />
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const Avatar = memo(function Avatar({
  initials,
  color,
  size = "md",
  isOnline,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-[52px] h-[52px] text-[15px]",
    lg: "w-14 h-14 text-base",
  };
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white select-none`}
        style={{ background: color }}
      >
        {initials}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-tg-online border-2 border-tg-sidebar rounded-full" />
      )}
    </div>
  );
});

// ── ChatItem ─────────────────────────────────────────────────────────────────

const ChatItem = memo(function ChatItem({
  chat,
  active,
  onClick,
}: {
  chat: ChatWithMeta;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`tg-chat-item flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors relative ${
        active ? "tg-chat-item-active" : "hover:bg-tg-hover"
      }`}
      onClick={onClick}
    >
      <Avatar
        initials={chat.avatar_initials}
        color={chat.avatar_color}
        isOnline={chat.is_online && chat.type === 'direct'}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {chat.is_pinned && <Pin size={11} className="text-tg-secondary flex-shrink-0" />}
            <span className="text-[15px] font-medium text-tg-text truncate">{chat.name}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {chat.is_muted && <BellOff size={13} className="text-tg-secondary" />}
            <span className="text-[12px] text-tg-secondary">{formatTime(chat.last_message_at)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-tg-secondary truncate flex-1">{chat.last_message || 'Нет сообщений'}</p>
          {chat.unread_count > 0 && (
            <span
              className={`ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold text-white flex items-center justify-center flex-shrink-0 ${
                chat.is_muted ? "bg-tg-secondary" : "bg-tg-accent"
              }`}
            >
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function ChatSidebar({ activeChat, onSelectChat }: ChatSidebarProps) {
  const { profile, signOut } = useAuth();
  const { chats, loading } = useChats();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const filtered = chats.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "unread" && c.unread_count > 0) ||
      (filter === "groups" && c.type === "group");
    return matchSearch && matchFilter;
  });

  const pinned = filtered.filter((c) => c.is_pinned);
  const regular = filtered.filter((c) => !c.is_pinned);

  const handleSelectChat = useCallback((id: string) => {
    onSelectChat(id);
  }, [onSelectChat]);

  return (
    <>
      <aside className="tg-sidebar flex flex-col h-full border-r border-tg-border">
        {/* Header */}
        <div className="tg-sidebar-header flex items-center justify-between px-4 py-3 relative">
          <button className="tg-icon-btn relative" onClick={() => setShowMenu(v => !v)}>
            <MoreVertical size={20} />
          </button>
          <h1 className="text-[15px] font-semibold text-tg-text">Мессенджер</h1>
          <button className="tg-icon-btn" onClick={() => setShowNewChat(true)}>
            <Edit size={18} />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div
              className="absolute top-12 left-2 z-50 bg-tg-sidebar rounded-xl shadow-lg border border-tg-border overflow-hidden min-w-[180px]"
              onMouseLeave={() => setShowMenu(false)}
            >
              {profile && (
                <div className="px-4 py-3 border-b border-tg-border">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: profile.avatar_color }}
                    >
                      {profile.avatar_initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-tg-text truncate">{profile.display_name}</p>
                      <p className="text-[11px] text-tg-secondary truncate">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-tg-text hover:bg-tg-hover transition-colors"
                onClick={() => { setShowMenu(false); }}
              >
                <UserCircle size={16} className="text-tg-secondary" />
                Профиль
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 hover:bg-tg-hover transition-colors"
                onClick={() => { setShowMenu(false); signOut(); }}
              >
                <LogOut size={16} />
                Выйти
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="tg-search-bar flex items-center gap-2 px-3 py-2 rounded-[20px]">
            <Search size={16} className="text-tg-secondary flex-shrink-0" />
            <input
              type="text"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[14px] text-tg-text placeholder-tg-secondary outline-none w-full"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto scrollbar-none">
          {(["all", "unread", "groups"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tg-filter-chip px-3 py-1 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                filter === f ? "tg-filter-chip-active" : "tg-filter-chip-inactive"
              }`}
            >
              {f === "all" ? "Все" : f === "unread" ? "Непрочитанные" : "Группы"}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto tg-scrollbar">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonChat key={i} />)
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  {pinned.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      active={activeChat === chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                    />
                  ))}
                  <div className="mx-4 border-t border-tg-divider my-1" />
                </>
              )}
              {regular.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  active={activeChat === chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                />
              ))}
              {filtered.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-tg-secondary">
                  <Search size={32} className="mb-2 opacity-40" />
                  <p className="text-[14px]">
                    {search ? 'Ничего не найдено' : 'Нет чатов'}
                  </p>
                  {!search && (
                    <button
                      className="mt-3 flex items-center gap-2 text-[13px] text-tg-accent hover:opacity-80 transition-opacity"
                      onClick={() => setShowNewChat(true)}
                    >
                      <Plus size={14} />
                      Начать диалог
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* New Chat FAB */}
        {!loading && (
          <div className="p-4 border-t border-tg-border">
            <button
              onClick={() => setShowNewChat(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-medium text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2196f3, #1565c0)' }}
            >
              <Plus size={16} />
              Новый чат
            </button>
          </div>
        )}
      </aside>

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChatCreated={(id) => { setShowNewChat(false); onSelectChat(id); }}
      />
    </>
  );
}
