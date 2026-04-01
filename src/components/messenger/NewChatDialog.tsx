import { useState } from "react";
import { X, Search, Loader2, Phone } from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

interface Props {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatDialog({ open, onClose, onChatCreated }: Props) {
  const { startDirectChat } = useChats();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const formatPhone = (raw: string) => {
    let v = raw.replace(/[^\d+]/g, "");
    if (!v.startsWith("+")) v = "+" + v;
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formatted = formatPhone(phone);

    if (!isValidPhoneNumber(formatted)) {
      setError("Неверный формат номера");
      return;
    }

    setLoading(true);
    const chatId = await startDirectChat(formatted);
    setLoading(false);

    if (!chatId) {
      setError("Пользователь с таким номером не найден");
      return;
    }

    setPhone("");
    onChatCreated(chatId);
  };

  const displayPhone = phone
    ? (() => {
        try {
          return parsePhoneNumber(formatPhone(phone)).formatInternational();
        } catch {
          return phone;
        }
      })()
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className="relative w-full sm:max-w-[360px] bg-tg-sidebar rounded-t-2xl sm:rounded-2xl border border-tg-border shadow-xl p-6 mx-0 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-tg-text">Новый диалог</h2>
          <button onClick={onClose} className="tg-icon-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-tg-secondary mb-1.5 uppercase tracking-wide">
              Телефон собеседника
            </label>
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-tg-bg border border-tg-border focus-within:border-tg-accent transition-colors">
              <Phone size={16} className="text-tg-secondary flex-shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 916 123-45-67"
                className="bg-transparent text-[15px] text-tg-text placeholder-tg-secondary outline-none flex-1"
                autoFocus
                autoComplete="tel"
              />
            </div>
            {displayPhone && phone.length > 5 && (
              <p className="text-[12px] text-tg-secondary mt-1 ml-1">{displayPhone}</p>
            )}
          </div>

          {error && (
            <p className="text-[13px] text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-medium text-tg-secondary bg-tg-bg border border-tg-border hover:bg-tg-hover transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !phone}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-medium text-white disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #2196f3, #1565c0)" }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {loading ? "Поиск..." : "Найти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
