import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { MessageSquare, Sparkles, Zap } from 'lucide-react'

import { MESSAGES_QUERY } from '../../graphql/queries'
import { ADD_MESSAGE, SEND_MESSAGE_ACTION, UPDATE_CHAT_TIMESTAMP } from '../../graphql/mutations'
import { Message } from '../../types'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'

interface ChatViewProps {
  chatId: string | null
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ✅ useQuery with polling
  const { data, loading, error, refetch } = useQuery(MESSAGES_QUERY, {
    variables: { chatId },
    skip: !chatId,
    pollInterval: 3000, // polls messages every 3s
  })

  const [addMessage] = useMutation(ADD_MESSAGE)
  const [sendMessageAction, { loading: isActionLoading }] = useMutation(SEND_MESSAGE_ACTION)
  const [updateChatTimestamp] = useMutation(UPDATE_CHAT_TIMESTAMP)

  const messages: Message[] = data?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async (content: string) => {
    if (!chatId) return

    try {
      // Save user’s message
      await addMessage({
        variables: {
          chatId,
          content,
          isBot: false,
        },
      })

      // Update chat timestamp
      await updateChatTimestamp({ variables: { chatId } })

      // Show typing animation
      setIsTyping(true)

      // Call Hasura Action → triggers chatbot workflow
      const result = await sendMessageAction({
        variables: { chatId, message: content },
      })

      setIsTyping(false)

      if (result.data?.sendMessage?.success) {
        await updateChatTimestamp({ variables: { chatId } })
      } else {
        await addMessage({
          variables: {
            chatId,
            content: '⚠️ Sorry, I encountered an error. Please try again.',
            isBot: true,
          },
        })
      }

      // ✅ Force refresh messages instantly after sending
      await refetch()
    } catch (err) {
      console.error('Error sending message:', err)
      setIsTyping(false)

      await addMessage({
        variables: {
          chatId,
          content: '⚠️ Sorry, I encountered an error. Please try again.',
          isBot: true,
        },
      })

      // ✅ Ensure we show the latest even if an error occurs
      await refetch()
    }
  }

  // ----------------------- UI -----------------------
  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="text-center">
          <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Welcome to AI Chat</h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Select an existing conversation from the sidebar or create a new one to start chatting
            with our AI assistant.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Instant responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span>Smart conversations</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-red-200">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h3>
          <p className="text-red-700 mb-1">Unable to load messages</p>
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-12">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Start the conversation</h3>
            <p className="text-slate-500">Send a message to begin chatting with AI</p>
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
  )
}