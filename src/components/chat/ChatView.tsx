import React, { useEffect, useRef, useState } from 'react';
import { useSubscription, useMutation } from '@apollo/client';
import { MessageSquare } from 'lucide-react';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/queries';
import { ADD_MESSAGE, SEND_MESSAGE_ACTION, UPDATE_CHAT_TIMESTAMP } from '../../graphql/mutations';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatViewProps {
  chatId: string | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data, loading, error } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId
  });

  const [addMessage] = useMutation(ADD_MESSAGE);
  const [sendMessageAction, { loading: isActionLoading }] = useMutation(SEND_MESSAGE_ACTION);
  const [updateChatTimestamp] = useMutation(UPDATE_CHAT_TIMESTAMP);

  const messages: Message[] = data?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!chatId) return;

    try {
      // Add user message
      await addMessage({
        variables: {
          chatId,
          content,
          isBot: false
        }
      });

      // Update chat timestamp
      await updateChatTimestamp({
        variables: { chatId }
      });

      // Show typing indicator
      setIsTyping(true);

      // Call Hasura Action to trigger chatbot
      const result = await sendMessageAction({
        variables: {
          chatId,
          message: content
        }
      });

      setIsTyping(false);

      if (result.data?.sendMessage?.success) {
        // The bot response should already be saved by the n8n workflow
        // Update chat timestamp again
        await updateChatTimestamp({
          variables: { chatId }
        });
      } else {
        // Handle error case
        await addMessage({
          variables: {
            chatId,
            content: 'Sorry, I encountered an error. Please try again.',
            isBot: true
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Add error message
      await addMessage({
        variables: {
          chatId,
          content: 'Sorry, I encountered an error. Please try again.',
          isBot: true
        }
      });
    }
  };

  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatBot</h3>
          <p className="text-gray-500 max-w-sm">
            Select an existing chat from the sidebar or create a new one to start chatting with AI.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading messages</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isActionLoading}
        disabled={!chatId}
      />
    </div>
  );
};