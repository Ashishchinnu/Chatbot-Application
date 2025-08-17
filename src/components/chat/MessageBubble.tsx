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
    <div className={`flex items-start space-x-3 ${isBot ? '' : 'justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-gray-600" />
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isBot ? '' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isBot
              ? 'bg-gray-100 text-gray-900'
              : 'bg-blue-600 text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isBot ? '' : 'text-right'}`}>
          {time}
        </p>
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center order-2">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};