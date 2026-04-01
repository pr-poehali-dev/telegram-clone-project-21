import { useState } from "react";
import { Search, Edit, MoreVertical, Pin, BellOff, Check, CheckCheck } from "lucide-react";
import { Chat, chatsData } from "@/data/messenger";

interface ChatSidebarProps {
  activeChat: string | null;
  onSelectChat: (id: string) => void;
}

function Avatar({
  initials,
  color,
  size = "md",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-14 h-14 text-base" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

export default function ChatSidebar({ activeChat, onSelectChat }: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");

  const filtered = chatsData.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "unread" && c.unread > 0) ||
      (filter === "groups" && c.isGroup);
    return matchSearch && matchFilter;
  });

  const pinned = filtered.filter((c) => c.pinned);
  const regular = filtered.filter((c) => !c.pinned);

  return (
    <aside className="tg-sidebar flex flex-col h-full border-r border-tg-border">
      {/* Header */}
      <div className="tg-sidebar-header flex items-center justify-between px-4 py-3">
        <button className="tg-icon-btn">
          <MoreVertical size={20} />
        </button>
        <h1 className="text-[15px] font-semibold text-tg-text">Telegram</h1>
        <button className="tg-icon-btn">
          <Edit size={18} />
        </button>
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
        {pinned.length > 0 && (
          <>
            {pinned.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                active={activeChat === chat.id}
                onClick={() => onSelectChat(chat.id)}
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
            onClick={() => onSelectChat(chat.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-tg-secondary">
            <Search size={32} className="mb-2 opacity-40" />
            <p className="text-[14px]">Ничего не найдено</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ChatItem({
  chat,
  active,
  onClick,
}: {
  chat: Chat;
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
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center font-semibold text-white text-[15px] select-none"
          style={{ background: chat.color }}
        >
          {chat.avatar}
        </div>
        {chat.online && !chat.isGroup && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-tg-online border-2 border-tg-sidebar rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {chat.pinned && <Pin size={11} className="text-tg-secondary flex-shrink-0" />}
            <span className="text-[15px] font-medium text-tg-text truncate">{chat.name}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {chat.muted && <BellOff size={13} className="text-tg-secondary" />}
            <span className="text-[12px] text-tg-secondary">{chat.lastTime}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-tg-secondary truncate flex-1">{chat.lastMessage}</p>
          {chat.unread > 0 && (
            <span
              className={`ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold text-white flex items-center justify-center flex-shrink-0 ${
                chat.muted ? "bg-tg-secondary" : "bg-tg-accent"
              }`}
            >
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
