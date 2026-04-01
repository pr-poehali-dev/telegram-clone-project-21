import { useState, useCallback } from "react";
import ChatSidebar from "@/components/messenger/ChatSidebar";
import ChatWindow from "@/components/messenger/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useChats } from "@/hooks/useChats";
import AuthPage from "./AuthPage";

export default function Index() {
  const { profile, loading, isSupabaseReady } = useAuth();
  const { chats } = useChats();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChat(id);
    setShowSidebar(false);
  }, []);

  const handleBack = useCallback(() => {
    setShowSidebar(true);
  }, []);

  const activeChatMeta = activeChat ? (chats.find(c => c.id === activeChat) ?? null) : null;

  // Loading splash
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-tg-bg">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2196f3, #1565c0)" }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png"
              alt="logo"
              className="w-10 h-10"
            />
          </div>
          <div className="w-8 h-8 border-2 border-tg-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Auth gate: если Supabase настроен — требуем авторизацию
  if (isSupabaseReady && !profile) {
    return <AuthPage />;
  }

  return (
    <div className="tg-app flex h-screen w-screen overflow-hidden bg-tg-bg select-none">
      {/* Sidebar */}
      <div
        className={`
          tg-sidebar-wrapper
          ${showSidebar ? "flex" : "hidden"}
          md:flex
          w-full md:w-[360px] lg:w-[400px]
          flex-shrink-0
          h-full
          flex-col
        `}
      >
        <ChatSidebar activeChat={activeChat} onSelectChat={handleSelectChat} />
      </div>

      {/* Chat Window */}
      <div
        className={`
          flex-1
          h-full
          ${showSidebar ? "hidden" : "flex"}
          md:flex
          flex-col
          min-w-0
          relative
        `}
      >
        <ChatWindow chatId={activeChat} chatMeta={activeChatMeta} onBack={handleBack} />
      </div>
    </div>
  );
}