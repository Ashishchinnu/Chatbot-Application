import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 group">
      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
        <Bot className="h-5 w-5 text-white" />
      </div>
      
      <div className="max-w-xs lg:max-w-md">
        <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">AI is thinking...</p>
      </div>
    </div>
  );
};