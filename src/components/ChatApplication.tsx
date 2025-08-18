import React, { useState } from 'react'
import { useUserData, useSignOut } from '@nhost/react'
import { ChatSidebar } from './chat/ChatSidebar'
import { ChatView } from './chat/ChatView'

export const ChatApplication: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const user = useUserData()
  const { signOut } = useSignOut()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">💬</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">ChatBot</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white">
          <ChatSidebar
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 bg-white">
          <ChatView chatId={selectedChatId} />
        </div>
      </div>
    </div>
  )
}