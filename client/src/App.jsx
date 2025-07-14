import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateChatProvider } from './context/PrivateChatContext';
import Login from './pages/Login';
import ChatRoom from './pages/ChatRoom';

function AppRoutes() {
  const { username } = useAuth();
  return username ? <ChatRoom /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <PrivateChatProvider>
        <AppRoutes />
      </PrivateChatProvider>
    </AuthProvider>
  );
}

export default App;
