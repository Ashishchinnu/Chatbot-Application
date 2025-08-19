// src/graphql/queries.ts
import { gql } from '@apollo/client'

// ✅ Query to fetch chats (replaces subscription for HTTP + polling)
export const CHATS_QUERY = gql`
  query Chats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages(order_by: { created_at: desc }, limit: 1) {
        id
        content
        is_bot
        created_at
      }
    }
  }
`

// ✅ Query to fetch messages (replaces subscription for HTTP + polling)
export const MESSAGES_QUERY = gql`
  query Messages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
      user_id
    }
  }
`

// (keep these if you still want subscription versions as backup)
export const MESSAGES_SUBSCRIPTION = gql`
  subscription MessagesSubscription($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
      user_id
    }
  }
`

export const CHATS_SUBSCRIPTION = gql`
  subscription ChatsSubscription {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages(order_by: { created_at: desc }, limit: 1) {
        id
        content
        is_bot
        created_at
      }
    }
  }
`