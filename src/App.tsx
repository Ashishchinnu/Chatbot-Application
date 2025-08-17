import React from 'react';
import { NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { nhost } from './config/nhost';
import { apolloClient } from './config/apollo';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { ChatApplication } from './components/ChatApplication';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost} apolloClient={apolloClient}>
        <AuthWrapper>
          <ChatApplication />
        </AuthWrapper>
      </NhostApolloProvider>
    </NhostProvider>
  );
}

export default App;