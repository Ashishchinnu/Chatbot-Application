import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Plus, MessageCircle, User, LogOut, Sparkles } from 'lucide-react'
import { useUserData, useSignOut } from '@nhost/react'

import { CHATS_QUERY } from '../../graphql/queries'   // ⬅️ change this
import { CREATE_CHAT } from '../../graphql/mutations'
import { Chat } from '../../types'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ChatSidebarProps {
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ selectedChatId, onChatSelect }) => {
  const user = useUserData()
  const { signOut } = useSignOut()

  // ⬇️ replaced useSubscription
  const { data, loading, error } = useQuery(CHATS_QUERY, {
    pollInterval: 5000, // refresh every 5 seconds
  })

  const [createChat, { loading: isCreatingChat }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      if (data.insert_chats_one) {
        onChatSelect(data.insert_chats_one.id)
      }
    },
  })

  const chats: Chat[] = data?.chats || []

  const handleNewChat = async () => {
    const title = `Chat ${new Date().toLocaleDateString()}`
    await createChat({ variables: { title } })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">AI Chats</h1>
          </div>
          <button
            onClick={handleNewChat}
            disabled={isCreatingChat}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105"
          >
            {isCreatingChat ? <LoadingSpinner size="sm" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>

        <button
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 text-sm bg-red-50 mx-4 rounded-lg border border-red-200">
            <div className="font-medium">Error loading chats</div>
            <div className="text-xs mt-1 text-red-500">{error.message}</div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No conversations yet</p>
            <p className="text-xs mt-1 text-slate-500">Start your first AI chat above</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                  selectedChatId === chat.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 border shadow-sm'
                    : 'hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium text-sm truncate ${
                      selectedChatId === chat.id ? 'text-blue-900' : 'text-slate-900'
                    }`}
                  >
                    {chat.title}
                  </h3>
                  <span
                    className={`text-xs flex-shrink-0 ml-2 ${
                      selectedChatId === chat.id ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    {formatTime(chat.updated_at)}
                  </span>
                </div>
                {chat.messages[0] && (
                  <p
                    className={`text-xs truncate ${
                      selectedChatId === chat.id ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {chat.messages[0].is_bot ? '🤖 ' : ''}
                    {chat.messages[0].content}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-emerald-600 flex items-center">
                <span className="h-2 w-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}