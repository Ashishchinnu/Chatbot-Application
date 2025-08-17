# ChatBot Application - Deployment Guide

This guide will walk you through deploying your ChatBot application to Netlify with all required services.

## Prerequisites Setup

### 1. Nhost Setup (Backend & Database)

1. **Create Nhost Project**:
   - Go to [nhost.io](https://nhost.io) and sign up
   - Create a new project
   - Note your subdomain and region

2. **Configure Authentication**:
   - In Nhost dashboard, go to Authentication
   - Enable email/password authentication
   - Disable email confirmation (for easier testing)
   - Configure any other auth settings as needed

3. **Set up Database**:
   - Go to Database section in Nhost dashboard
   - Open SQL Editor
   - Run the SQL from `database-schema.sql` file
   - This will create tables with proper RLS policies

4. **Configure Hasura**:
   - In Nhost dashboard, go to GraphQL
   - This opens Hasura Console
   - Set up permissions for the `user` role on both tables
   - Create the Hasura Action using the provided JSON files

### 2. n8n Setup (Automation Workflow)

1. **Deploy n8n**:
   - Option A: Use [n8n.cloud](https://n8n.cloud) (recommended)
   - Option B: Self-host on Railway, Heroku, or DigitalOcean
   - Option C: Use local n8n with ngrok for development

2. **Import Workflow**:
   - Import the `n8n-workflow.json` file
   - Update all placeholder URLs and API keys
   - Activate the workflow

3. **Configure Webhook**:
   - Note the webhook URL from n8n
   - Update your Hasura Action handler URL

### 3. OpenRouter Setup

1. **Get API Key**:
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Generate an API key
   - Add credits or use free tier models

2. **Configure in n8n**:
   - Update the OpenRouter API key in your n8n workflow
   - Test the API connection

## Netlify Deployment

### Method 1: GitHub Integration (Recommended)

1. **Prepare Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/chatbot-app.git
   git push -u origin main
   ```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Environment Variables**:
   - In Netlify dashboard → Site settings → Environment variables
   - Add:
     ```
     REACT_APP_NHOST_SUBDOMAIN=your-nhost-subdomain
     REACT_APP_NHOST_REGION=your-region
     ```

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete
   - Your app will be live at the provided Netlify URL

### Method 2: Manual Deployment

1. **Build Locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder to deploy
   - Set environment variables in site settings

### Method 3: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**:
   ```bash
   netlify login
   netlify deploy --prod --dir=dist
   ```

## Configuration Checklist

Before going live, verify:

- [ ] Nhost project created and authentication enabled
- [ ] Database schema deployed with RLS policies
- [ ] Hasura permissions configured for `user` role  
- [ ] Hasura Action `sendMessage` created and configured
- [ ] n8n workflow imported and activated
- [ ] OpenRouter API key configured in n8n
- [ ] All placeholder URLs updated in n8n workflow
- [ ] Environment variables set in Netlify
- [ ] Application builds successfully
- [ ] Authentication flow works
- [ ] Chat creation and messaging works
- [ ] AI responses are generated

## Testing Your Deployment

1. **Test Authentication**:
   - Sign up with a new email
   - Sign in with existing account
   - Check that unauthorized users can't access the app

2. **Test Chat Functionality**:
   - Create a new chat
   - Send a message
   - Verify AI response appears
   - Test real-time updates in another browser tab

3. **Test Permissions**:
   - Create chats with one account
   - Sign in with different account
   - Verify users can only see their own chats

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Authentication Issues**:
   - Verify Nhost subdomain and region
   - Check that authentication is enabled in Nhost
   - Ensure environment variables are set correctly

3. **GraphQL Errors**:
   - Check Hasura permissions
   - Verify RLS policies are active
   - Test GraphQL queries in Hasura console

4. **n8n Workflow Issues**:
   - Check webhook URL is accessible
   - Verify all API keys are correct
   - Test each node individually

5. **AI Responses Not Working**:
   - Check OpenRouter API key
   - Verify OpenRouter account has credits
   - Test API directly with curl

## Production Considerations

1. **Security**:
   - Use strong passwords for all services
   - Enable 2FA where available
   - Regularly rotate API keys
   - Monitor access logs

2. **Performance**:
   - Consider upgrading Nhost plan for better performance
   - Monitor database query performance
   - Optimize n8n workflow execution time

3. **Monitoring**:
   - Set up Netlify analytics
   - Monitor Nhost usage
   - Set up alerts for n8n workflow failures

4. **Backup**:
   - Regularly backup your database
   - Export n8n workflows
   - Keep environment variables documented

## Support

If you encounter issues:

1. Check browser console for frontend errors
2. Check Nhost logs for backend issues  
3. Check n8n execution logs for workflow problems
4. Verify all environment variables and API keys
5. Test components individually to isolate issues

Your ChatBot application should now be fully deployed and accessible at your Netlify URL!