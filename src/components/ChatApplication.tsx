import React, { useState } from 'react';
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatView } from './chat/ChatView';

export const ChatApplication: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatView chatId={selectedChatId} />
      </div>
    </div>
  );
};