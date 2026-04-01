import { useState, useRef, useEffect } from "react";
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
  Users,
} from "lucide-react";
import { chatsData, messagesData, CURRENT_USER, senderNames, Message } from "@/data/messenger";

interface ChatWindowProps {
  chatId: string | null;
  onBack?: () => void;
}

const emojiList = ["😊", "😂", "❤️", "👍", "🔥", "🎉", "😎", "🙏", "👋", "💯", "🤔", "😢"];

export default function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>(
    chatId ? (messagesData[chatId] ?? []) : []
  );
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatId) {
      setMessages(messagesData[chatId] ?? []);
      setInputText("");
      setShowEmoji(false);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      </div>
    );
  }

  const chat = chatsData.find((c) => c.id === chatId);
  if (!chat) return null;

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `${chatId}-${Date.now()}`,
      chatId,
      senderId: CURRENT_USER.id,
      text,
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setShowEmoji(false);
    inputRef.current?.focus();

    // Simulate typing + reply
    if (!chat.isGroup) {
      setTypingIndicator(true);
      setTimeout(() => {
        setTypingIndicator(false);
        const replies = [
          "Понял, спасибо!",
          "Хорошо, разберусь",
          "Окей 👍",
          "Отлично!",
          "Согласен с тобой",
          "Интересно, надо подумать...",
          "Ок, напишу позже",
          "Конечно!",
        ];
        const reply: Message = {
          id: `${chatId}-reply-${Date.now()}`,
          chatId,
          senderId: chatId,
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          status: "read",
          isOwn: false,
        };
        setMessages((prev) => [...prev, reply]);
      }, 1500 + Math.random() * 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = groupByDate(messages);

  const statusIcon = (msg: Message) => {
    if (!msg.isOwn) return null;
    if (msg.status === "read") return <CheckCheck size={14} className="text-tg-accent flex-shrink-0" />;
    if (msg.status === "delivered") return <CheckCheck size={14} className="text-tg-secondary flex-shrink-0" />;
    return <Check size={14} className="text-tg-secondary flex-shrink-0" />;
  };

  return (
    <div className="tg-chat-window flex flex-col h-full flex-1">
      {/* Chat Header */}
      <div className="tg-chat-header flex items-center gap-3 px-4 py-2 border-b border-tg-border bg-tg-header">
        {onBack && (
          <button onClick={onBack} className="tg-icon-btn mr-1">
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Avatar */}
        <div className="relative cursor-pointer">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-[13px] select-none"
            style={{ background: chat.color }}
          >
            {chat.avatar}
          </div>
          {chat.online && !chat.isGroup && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-tg-online border-2 border-tg-header rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer">
          <h2 className="text-[15px] font-semibold text-tg-text leading-tight truncate">
            {chat.name}
          </h2>
          <p className="text-[12px] text-tg-accent leading-tight">
            {typingIndicator
              ? "печатает..."
              : chat.isGroup
              ? `${chat.members} участников`
              : chat.online
              ? "онлайн"
              : "последний раз недавно"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="tg-icon-btn"><Search size={18} /></button>
          <button className="tg-icon-btn hidden sm:flex"><Phone size={18} /></button>
          <button className="tg-icon-btn hidden sm:flex"><Video size={18} /></button>
          <button className="tg-icon-btn"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto tg-scrollbar py-4 px-4"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(82,136,193,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(82,136,193,0.04) 0%, transparent 60%)",
          backgroundColor: "var(--tg-bg-chat)",
        }}
        onClick={() => setShowEmoji(false)}
      >
        {groupedMessages.map(({ dateLabel, msgs }) => (
          <div key={dateLabel}>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <span className="tg-date-sep text-[12px] text-tg-secondary px-3 py-1 rounded-full">
                {dateLabel}
              </span>
            </div>

            {msgs.map((msg, i) => {
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const nextMsg = i < msgs.length - 1 ? msgs[i + 1] : null;
              const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isLast = !nextMsg || nextMsg.senderId !== msg.senderId;

              if (msg.type === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="tg-date-sep text-[12px] text-tg-secondary px-3 py-1 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.isOwn ? "justify-end" : "justify-start"} ${
                    isLast ? "mb-2" : "mb-0.5"
                  }`}
                >
                  {/* Avatar for group */}
                  {!msg.isOwn && chat.isGroup && (
                    <div className="w-8 flex-shrink-0">
                      {isLast ? (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: chat.color }}
                        >
                          {senderNames[msg.senderId]?.[0] ?? "?"}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`tg-bubble max-w-[70%] px-3 py-2 ${
                      msg.isOwn
                        ? "tg-bubble-own rounded-[16px_16px_4px_16px]"
                        : "tg-bubble-other rounded-[16px_16px_16px_4px]"
                    } ${isFirst && !msg.isOwn ? (msg.isOwn ? "rounded-tr-[4px]" : "rounded-tl-[4px]") : ""}`}
                  >
                    {/* Sender name in group */}
                    {!msg.isOwn && chat.isGroup && isFirst && (
                      <p
                        className="text-[12px] font-semibold mb-0.5"
                        style={{ color: chat.color }}
                      >
                        {senderNames[msg.senderId] ?? "Участник"}
                      </p>
                    )}

                    <div className="flex items-end gap-2">
                      <p className="text-[14px] leading-[1.4] whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                      <div className="flex items-center gap-0.5 flex-shrink-0 self-end ml-auto pl-1">
                        <span className="text-[11px] opacity-60">{msg.time}</span>
                        {statusIcon(msg)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingIndicator && (
          <div className="flex items-end gap-2 mb-2">
            <div className="tg-bubble tg-bubble-other rounded-[16px_16px_16px_4px] px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="tg-typing-dot" />
                <span className="tg-typing-dot" style={{ animationDelay: "0.2s" }} />
                <span className="tg-typing-dot" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="tg-emoji-picker border-t border-tg-border px-4 py-3 flex flex-wrap gap-2">
          {emojiList.map((e) => (
            <button
              key={e}
              onClick={() => setInputText((prev) => prev + e)}
              className="text-[22px] hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="tg-input-area border-t border-tg-border px-3 py-2 flex items-end gap-2 bg-tg-header">
        <button
          className="tg-icon-btn mb-1 flex-shrink-0"
          onClick={() => setShowEmoji((v) => !v)}
        >
          <Smile size={22} className={showEmoji ? "text-tg-accent" : ""} />
        </button>

        <div className="flex-1 tg-input-wrap rounded-[20px] flex items-end px-3 py-2 min-h-[40px]">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение..."
            rows={1}
            className="tg-textarea flex-1 bg-transparent text-[14px] text-tg-text placeholder-tg-secondary outline-none resize-none max-h-[140px] leading-[1.4]"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 140) + "px";
            }}
          />
        </div>

        <button className="tg-icon-btn mb-1 flex-shrink-0">
          <Paperclip size={20} />
        </button>

        {inputText.trim() ? (
          <button
            onClick={handleSend}
            className="tg-send-btn w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
          >
            <Send size={18} />
          </button>
        ) : (
          <button className="tg-icon-btn mb-1 flex-shrink-0">
            <Mic size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

function groupByDate(messages: Message[]) {
  // Simple grouping — all under "Сегодня" for demo
  const groups: { dateLabel: string; msgs: Message[] }[] = [];
  let currentGroup: { dateLabel: string; msgs: Message[] } | null = null;

  messages.forEach((msg) => {
    const label = "Сегодня";
    if (!currentGroup || currentGroup.dateLabel !== label) {
      currentGroup = { dateLabel: label, msgs: [msg] };
      groups.push(currentGroup);
    } else {
      currentGroup.msgs.push(msg);
    }
  });

  return groups;
}
