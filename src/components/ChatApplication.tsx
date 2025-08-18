import React, { useState } from 'react'
import { useSignOut } from '@nhost/react'
import { ChatSidebar } from './chat/ChatSidebar'
import { ChatView } from './chat/ChatView'

export const ChatApplication: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const { signOut } = useSignOut()

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border-b px-4 py-2 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">💬 ChatBot</h1>
        <button
          onClick={signOut}
          className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>

      {/* Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r overflow-y-auto">
          <ChatSidebar
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <ChatView chatId={selectedChatId} />
        </div>
      </div>
    </div>
  )
}