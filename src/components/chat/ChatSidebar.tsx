import React from 'react';
import { useSubscription, useMutation } from '@apollo/client';
import { Plus, MessageCircle, User, LogOut } from 'lucide-react';
import { useUserData, useSignOut } from '@nhost/react';
import { CHATS_SUBSCRIPTION } from '../../graphql/queries';
import { CREATE_CHAT } from '../../graphql/mutations';
import { Chat } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ChatSidebarProps {
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  selectedChatId, 
  onChatSelect 
}) => {
  const user = useUserData();
  const { signOut } = useSignOut();
  const { data, loading, error } = useSubscription(CHATS_SUBSCRIPTION);
  const [createChat, { loading: isCreatingChat }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      if (data.insert_chats_one) {
        onChatSelect(data.insert_chats_one.id);
      }
    }
  });

  const chats: Chat[] = data?.chats || [];

  const handleNewChat = async () => {
    const title = `Chat ${new Date().toLocaleDateString()}`;
    await createChat({ variables: { title } });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Chats</h1>
          </div>
          <button
            onClick={handleNewChat}
            disabled={isCreatingChat}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          >
            {isCreatingChat ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <button
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 text-sm">
            Error loading chats: {error.message}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Create a new chat to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-blue-50 border-blue-200 border'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {chat.title}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(chat.updated_at)}
                  </span>
                </div>
                {chat.messages[0] && (
                  <p className="text-xs text-gray-500 truncate">
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};