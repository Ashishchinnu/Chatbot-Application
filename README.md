# ChatBot Application

A modern, real-time chatbot application built with React, TypeScript, Nhost authentication, Hasura GraphQL, and n8n automation.

## Features

- 🔐 **Email Authentication** - Secure sign-up/sign-in with Nhost Auth
- 💬 **Real-time Chat** - Live messaging with GraphQL subscriptions
- 🤖 **AI Chatbot** - Powered by OpenRouter API through n8n workflows
- 🔒 **Row-Level Security** - Users can only access their own data
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⚡ **Real-time Updates** - Instant message delivery and chat updates

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Authentication**: Nhost Auth
- **Backend**: Hasura GraphQL
- **Database**: PostgreSQL with Row-Level Security
- **Automation**: n8n workflows
- **AI**: OpenRouter API
- **Deployment**: Netlify

## Prerequisites

Before setting up the application, you'll need:

1. **Nhost Account** - [Sign up at nhost.io](https://nhost.io)
2. **n8n Instance** - [Set up n8n](https://n8n.io) (cloud or self-hosted)
3. **OpenRouter Account** - [Get API key from openrouter.ai](https://openrouter.ai)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd chatbot-application
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your Nhost configuration:

```env
REACT_APP_NHOST_SUBDOMAIN=your-nhost-subdomain
REACT_APP_NHOST_REGION=your-region
```

### 3. Database Schema Setup

In your Hasura console, run these SQL commands to create the required tables:

```sql
-- Create chats table
CREATE TABLE chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_bot boolean DEFAULT false,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats table
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT user_id FROM chats WHERE id = messages.chat_id)
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT user_id FROM chats WHERE id = messages.chat_id)
  );

-- Create indexes for performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### 4. Hasura Permissions Setup

Set up permissions in Hasura Console:

#### Chats Table Permissions (user role):
- **Select**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- **Insert**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- **Update**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- **Delete**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`

#### Messages Table Permissions (user role):
- **Select**: `{"_or": [{"user_id": {"_eq": "X-Hasura-User-Id"}}, {"chat": {"user_id": {"_eq": "X-Hasura-User-Id"}}}]}`
- **Insert**: `{"_or": [{"user_id": {"_eq": "X-Hasura-User-Id"}}, {"chat": {"user_id": {"_eq": "X-Hasura-User-Id"}}}]}`

### 5. Create Hasura Action

In Hasura Console, create an Action called `sendMessage`:

**Action Definition**:
```graphql
type Mutation {
  sendMessage(chat_id: uuid!, message: String!): SendMessageOutput
}

type SendMessageOutput {
  success: Boolean!
  message: String!
  response: String
}
```

**Handler**: `https://your-n8n-instance.com/webhook/send-message`

**Headers**: Add any required authentication headers for your n8n instance.

**Permissions**: Allow for `user` role.

### 6. n8n Workflow Setup

Create a workflow in n8n with the following nodes:

1. **Webhook Node**: 
   - HTTP Method: POST
   - Path: `send-message`

2. **Function Node** (Validate User):
   ```javascript
   // Validate that the user owns the chat
   const chatId = $json.body.input.chat_id;
   const userId = $json.body.session_variables['x-hasura-user-id'];
   
   return {
     chat_id: chatId,
     user_id: userId,
     message: $json.body.input.message
   };
   ```

3. **HTTP Request Node** (Check Chat Ownership):
   - Method: POST
   - URL: `https://your-nhost-subdomain.nhost.run/v1/graphql`
   - Headers: 
     ```json
     {
       "Content-Type": "application/json",
       "x-hasura-admin-secret": "your-admin-secret"
     }
     ```
   - Body:
     ```json
     {
       "query": "query GetChat($chatId: uuid!) { chats_by_pk(id: $chatId) { id user_id } }",
       "variables": {
         "chatId": "={{ $json.chat_id }}"
       }
     }
     ```

4. **IF Node**: Check if chat belongs to user

5. **HTTP Request Node** (OpenRouter):
   - Method: POST
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Headers:
     ```json
     {
       "Authorization": "Bearer YOUR_OPENROUTER_API_KEY",
       "Content-Type": "application/json"
     }
     ```
   - Body:
     ```json
     {
       "model": "meta-llama/llama-3.2-3b-instruct:free",
       "messages": [
         {
           "role": "user",
           "content": "={{ $json.message }}"
         }
       ]
     }
     ```

6. **HTTP Request Node** (Save Bot Response):
   - Method: POST
   - URL: `https://your-nhost-subdomain.nhost.run/v1/graphql`
   - Headers:
     ```json
     {
       "Content-Type": "application/json",
       "x-hasura-admin-secret": "your-admin-secret"
     }
     ```
   - Body:
     ```json
     {
       "query": "mutation AddMessage($chatId: uuid!, $content: String!) { insert_messages_one(object: {chat_id: $chatId, content: $content, is_bot: true}) { id } }",
       "variables": {
         "chatId": "={{ $('Function').first().json.chat_id }}",
         "content": "={{ $json.choices[0].message.content }}"
       }
     }
     ```

7. **Respond to Webhook Node**:
   ```json
   {
     "success": true,
     "message": "Response generated successfully",
     "response": "={{ $('OpenRouter API').first().json.choices[0].message.content }}"
   }
   ```

### 7. Run the Application

```bash
npm run dev
```

## Deployment to Netlify

### Option 1: Deploy from GitHub

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Set Environment Variables**:
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add your Nhost configuration:
     ```
     REACT_APP_NHOST_SUBDOMAIN=your-nhost-subdomain
     REACT_APP_NHOST_REGION=your-region
     ```

### Option 2: Manual Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

## Configuration Checklist

Before deploying, ensure you have:

- ✅ Nhost project created with authentication enabled
- ✅ Database schema created with proper RLS policies
- ✅ Hasura permissions configured for `user` role
- ✅ Hasura Action `sendMessage` created and configured
- ✅ n8n workflow created and activated
- ✅ OpenRouter API key configured in n8n
- ✅ Environment variables set in Netlify
- ✅ All API endpoints and webhooks properly configured

## Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check Nhost subdomain and region in `.env`
   - Verify authentication is enabled in Nhost console

2. **GraphQL errors**:
   - Check Hasura permissions for `user` role
   - Verify RLS policies are correctly set up

3. **Chatbot not responding**:
   - Check n8n workflow is activated
   - Verify OpenRouter API key is valid
   - Check Hasura Action webhook URL is correct

4. **Real-time updates not working**:
   - Ensure WebSocket connection is established
   - Check browser console for connection errors

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Test each component (auth, GraphQL, n8n workflow) individually
4. Check the network tab for failed requests

## Security Notes

- Never expose API keys in frontend code
- Use environment variables for all sensitive configuration
- Ensure RLS policies are properly configured
- Validate all user inputs in your n8n workflow
- Use HTTPS for all production endpoints

## License

MIT License - see LICENSE file for details.