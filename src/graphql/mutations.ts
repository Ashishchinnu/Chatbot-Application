import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      updated_at
    }
  }
`;

export const ADD_MESSAGE = gql`
  mutation AddMessage($chatId: uuid!, $content: String!, $isBot: Boolean!) {
    insert_messages_one(
      object: { 
        chat_id: $chatId, 
        content: $content, 
        is_bot: $isBot 
      }
    ) {
      id
      content
      is_bot
      created_at
      user_id
    }
  }
`;

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessageAction($chatId: uuid!, $message: String!) {
    sendMessage(chat_id: $chatId, message: $message) {
      success
      message
      response
    }
  }
`;

export const UPDATE_CHAT_TIMESTAMP = gql`
  mutation UpdateChatTimestamp($chatId: uuid!) {
    update_chats_by_pk(
      pk_columns: { id: $chatId }
      _set: { updated_at: "now()" }
    ) {
      id
      updated_at
    }
  }
`;