import { useState } from "react";
import ChatSidebar from "@/components/messenger/ChatSidebar";
import ChatWindow from "@/components/messenger/ChatWindow";

export default function Index() {
  const [activeChat, setActiveChat] = useState<string | null>("1");
  const [showSidebar, setShowSidebar] = useState(true);

  // On mobile: toggle between sidebar and chat
  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  return (
    <div className="tg-app flex h-screen w-screen overflow-hidden bg-tg-bg select-none">
      {/* Sidebar — always visible on desktop, toggleable on mobile */}
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
        `}
      >
        <ChatWindow chatId={activeChat} onBack={handleBack} />
      </div>
    </div>
  );
}
