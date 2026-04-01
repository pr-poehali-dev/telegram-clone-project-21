import { memo, useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Mic,
  CheckCheck,
  Check,
  Clock,
  Lock,
  ChevronDown,
} from "lucide-react";
import { useMessages, type Message } from "@/hooks/useMessages";
import { type ChatWithMeta } from "@/hooks/useChats";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

interface ChatWindowProps {
  chatId: string | null;
  chatMeta?: ChatWithMeta | null;
  onBack?: () => void;
}

const emojiList = ["😊", "😂", "❤️", "👍", "🔥", "🎉", "😎", "🙏", "👋", "💯", "🤔", "😢", "🥰", "👏", "🎯", "✅"];

// ── Форматирование даты ───────────────────────────────────────────────────────

function formatDateLabel(iso: string): string {
  try {
    const date = parseISO(iso);
    if (isToday(date)) return "Сегодня";
    if (isYesterday(date)) return "Вчера";
    return format(date, "d MMMM yyyy", { locale: ru });
  } catch {
    return "";
  }
}

function formatMsgTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

function getDateKey(iso: string): string {
  try {
    return parseISO(iso).toDateString();
  } catch {
    return iso.slice(0, 10);
  }
}

// ── Группировка по дате ───────────────────────────────────────────────────────

function groupByDate(msgs: Message[]) {
  const groups: { dateKey: string; dateLabel: string; msgs: Message[] }[] = [];
  for (const msg of msgs) {
    const dateKey = getDateKey(msg.created_at);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.msgs.push(msg);
    } else {
      groups.push({ dateKey, dateLabel: formatDateLabel(msg.created_at), msgs: [msg] });
    }
  }
  return groups;
}

// ── Status icon ───────────────────────────────────────────────────────────────

const StatusIcon = memo(function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') return <Clock size={13} className="text-tg-secondary flex-shrink-0 opacity-60" />;
  if (status === 'read') return <CheckCheck size={14} className="text-tg-accent flex-shrink-0" />;
  if (status === 'delivered') return <CheckCheck size={14} className="text-tg-secondary flex-shrink-0" />;
  return <Check size={14} className="text-tg-secondary flex-shrink-0" />;
});

// ── Bubble ────────────────────────────────────────────────────────────────────

const MessageBubble = memo(function MessageBubble({
  msg,
  isFirst,
  isLast,
  isGroup,
}: {
  msg: Message;
  isFirst: boolean;
  isLast: boolean;
  isGroup: boolean;
}) {
  const ownRadius = `${isFirst ? '18px' : '4px'} 18px 18px ${isLast ? '18px' : '4px'}`;
  const otherRadius = `18px ${isFirst ? '18px' : '4px'} ${isLast ? '18px' : '4px'} 18px`;

  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="tg-date-sep text-[12px] text-tg-secondary px-3 py-1 rounded-full">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-2 ${msg.isOwn ? "justify-end" : "justify-start"} ${
        isLast ? "mb-2" : "mb-0.5"
      }`}
    >
      {/* Group avatar */}
      {!msg.isOwn && isGroup && (
        <div className="w-7 flex-shrink-0">
          {isLast ? (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: msg.senderColor || '#5288c1' }}
            >
              {msg.senderInitials?.[0] || '?'}
            </div>
          ) : null}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`tg-bubble max-w-[70%] px-3 py-2 ${
          msg.isOwn ? "tg-bubble-own" : "tg-bubble-other"
        }`}
        style={{ borderRadius: msg.isOwn ? ownRadius : otherRadius }}
      >
        {/* Sender name in group */}
        {!msg.isOwn && isGroup && isFirst && msg.senderName && (
          <p
            className="text-[12px] font-semibold mb-0.5"
            style={{ color: msg.senderColor }}
          >
            {msg.senderName}
          </p>
        )}

        <p className="text-[14px] leading-[1.45] whitespace-pre-wrap break-words">
          {msg.text}
        </p>

        <div className={`flex items-center gap-1 mt-0.5 ${msg.isOwn ? 'justify-end' : 'justify-end'}`}>
          <span className="text-[11px] opacity-60">{formatMsgTime(msg.created_at)}</span>
          {msg.isOwn && <StatusIcon status={msg.status} />}
        </div>
      </div>
    </div>
  );
});

// ── Typing Indicator ──────────────────────────────────────────────────────────

const TypingIndicator = memo(function TypingIndicator({ users }: { users: string[] }) {
  if (!users.length) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="tg-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-[12px] text-tg-secondary">
        {users.length === 1 ? `${users[0]} печатает...` : `${users.length} человека печатают...`}
      </span>
    </div>
  );
});

// ── Main Window ───────────────────────────────────────────────────────────────

export default function ChatWindow({ chatId, chatMeta, onBack }: ChatWindowProps) {
  const { profile } = useAuth();
  const { messages, loading, hasMore, typingUsers, sendMessage, sendTyping, loadMore } = useMessages(chatId);

  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);

  const chat = chatMeta;

  // Scroll to bottom on new messages (only if at bottom)
  useEffect(() => {
    const newMsgs = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (newMsgs && isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [chatId, loading]);

  const handleScroll = useCallback(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distanceFromBottom < 100;
    setShowScrollBtn(distanceFromBottom > 300);

    // Load more when near top
    if (el.scrollTop < 100 && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendMessage(text);
    setInputText("");
    setShowEmoji(false);
    inputRef.current?.focus();
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [inputText, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    sendTyping();
    // Auto-resize textarea
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [sendTyping]);

  if (!chatId) {
    return (
      <div className="tg-chat-empty flex-1 flex flex-col items-center justify-center bg-tg-bg-chat">
        <div className="tg-empty-icon w-24 h-24 rounded-full flex items-center justify-center mb-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png"
            alt="Telegram"
            className="w-14 h-14 opacity-30"
          />
        </div>
        <h2 className="text-[20px] font-semibold text-tg-text mb-2">Выберите чат</h2>
        <p className="text-[14px] text-tg-secondary text-center max-w-[240px]">
          Выберите чат из списка слева, чтобы начать общение
        </p>
        <div className="flex items-center gap-1.5 mt-6 text-[12px] text-tg-secondary/60">
          <Lock size={12} />
          <span>E2E шифрование</span>
        </div>
      </div>
    );
  }

  const groupedMessages = groupByDate(messages);

  return (
    <div className="tg-chat-window flex flex-col h-full flex-1">
      {/* Header */}
      <div className="tg-chat-header flex items-center gap-3 px-4 py-2 border-b border-tg-border bg-tg-header">
        {onBack && (
          <button onClick={onBack} className="tg-icon-btn mr-1">
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-[13px] select-none"
            style={{ background: chat?.avatar_color || '#5288c1' }}
          >
            {chat?.avatar_initials || '??'}
          </div>
          {chat?.is_online && chat.type === 'direct' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-tg-online border-2 border-tg-header rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer">
          <h2 className="text-[15px] font-semibold text-tg-text leading-tight truncate">
            {chat?.name || '...'}
          </h2>
          <p className="text-[12px] text-tg-accent leading-tight">
            {typingUsers.length > 0
              ? `${typingUsers[0]} печатает...`
              : chat?.type === 'group'
              ? `${chat.member_count} участников`
              : chat?.is_online
              ? 'онлайн'
              : 'не в сети'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="tg-icon-btn hidden sm:flex"><Search size={18} /></button>
          <button className="tg-icon-btn hidden sm:flex"><Phone size={18} /></button>
          <button className="tg-icon-btn hidden sm:flex"><Video size={18} /></button>
          <button className="tg-icon-btn"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesAreaRef}
        className="flex-1 overflow-y-auto tg-scrollbar py-4 px-2 sm:px-4 relative"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(82,136,193,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(82,136,193,0.04) 0%, transparent 60%)",
          backgroundColor: "var(--tg-bg-chat)",
        }}
        onScroll={handleScroll}
        onClick={() => setShowEmoji(false)}
      >
        {/* Load more indicator */}
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-tg-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasMore && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-tg-secondary/50 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {groupedMessages.map(({ dateKey, dateLabel, msgs }) => (
          <div key={dateKey}>
            <div className="flex justify-center my-4">
              <span className="tg-date-sep text-[12px] text-tg-secondary px-3 py-1 rounded-full">
                {dateLabel}
              </span>
            </div>
            {msgs.map((msg, i) => {
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const nextMsg = i < msgs.length - 1 ? msgs[i + 1] : null;
              const isFirst = !prevMsg || prevMsg.sender_id !== msg.sender_id || prevMsg.type === 'system';
              const isLast = !nextMsg || nextMsg.sender_id !== msg.sender_id || nextMsg.type === 'system';
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isFirst={isFirst}
                  isLast={isLast}
                  isGroup={chat?.type === 'group'}
                />
              );
            })}
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-tg-secondary">
            <Lock size={28} className="mb-3 opacity-40" />
            <p className="text-[14px] font-medium">Нет сообщений</p>
            <p className="text-[12px] opacity-60 mt-1">Сообщения защищены E2E-шифрованием</p>
          </div>
        )}

        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          className="absolute bottom-24 right-6 w-10 h-10 rounded-full bg-tg-sidebar shadow-lg border border-tg-border flex items-center justify-center hover:bg-tg-hover transition-colors z-10"
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <ChevronDown size={18} className="text-tg-accent" />
        </button>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="tg-emoji-picker border-t border-tg-border px-4 py-3 flex flex-wrap gap-2">
          {emojiList.map((e) => (
            <button
              key={e}
              className="text-[22px] hover:scale-125 transition-transform active:scale-110"
              onClick={() => setInputText((t) => t + e)}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-tg-border bg-tg-header px-3 py-2">
        <div className="flex items-end gap-2">
          <button className="tg-icon-btn flex-shrink-0 mb-1">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 tg-input-wrap rounded-[22px] px-4 py-2 flex items-end gap-2 min-h-[44px]">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Сообщение"
              rows={1}
              className="tg-textarea bg-transparent text-[14px] text-tg-text placeholder-tg-secondary outline-none w-full resize-none max-h-[120px] py-0.5"
              style={{ lineHeight: '1.4' }}
            />
            <button
              className="tg-icon-btn flex-shrink-0 mb-0.5"
              onClick={() => setShowEmoji((v) => !v)}
            >
              <Smile size={20} />
            </button>
          </div>

          {inputText.trim() ? (
            <button
              className="tg-send-btn w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0"
              onClick={handleSend}
            >
              <Send size={18} />
            </button>
          ) : (
            <button className="tg-icon-btn flex-shrink-0">
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}