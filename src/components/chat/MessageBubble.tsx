import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.is_bot;
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex items-start space-x-3 ${isBot ? '' : 'justify-end'} group`}>
      {isBot && (
        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-2xl ${isBot ? '' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isBot
              ? 'bg-white border border-slate-200 text-slate-900'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <p className={`text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isBot ? '' : 'text-right'}`}>
          {time}
        </p>
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center order-2 shadow-sm">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};