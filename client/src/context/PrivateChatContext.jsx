import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../socket';
import { useAuth } from './AuthContext';

const PrivateChatContext = createContext();

export function PrivateChatProvider({ children }) {
  const { username } = useAuth();
  const [privateMessages, setPrivateMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    function handlePrivateMessage(msg) {
      console.log('Private message received:', msg);
      if (msg.sender === username || msg.recipient === username) {
        const otherUser = msg.sender === username ? msg.recipient : msg.sender;
        const chatKey = [username, otherUser].sort().join('-');
        
        console.log('Processing message for chat key:', chatKey, 'otherUser:', otherUser);
        
        setPrivateMessages(prev => ({
          ...prev,
          [chatKey]: [...(prev[chatKey] || []), msg]
        }));

        // Update unread count if message is from someone else
        if (msg.sender !== username) {
          console.log('Updating unread count for:', otherUser);
          setUnreadCounts(prev => ({
            ...prev,
            [otherUser]: (prev[otherUser] || 0) + 1
          }));
        }
      }
    }

    socket.on('private-message', handlePrivateMessage);
    return () => socket.off('private-message', handlePrivateMessage);
  }, [username]);

  const sendPrivateMessage = (recipient, text) => {
    console.log('Sending private message to:', recipient, 'text:', text);
    const msg = {
      sender: username,
      recipient,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const chatKey = [username, recipient].sort().join('-');
    
    setPrivateMessages(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), msg]
    }));
    
    socket.emit('private-message', msg);
  };

  const markAsRead = (otherUser) => {
    console.log('Marking as read for:', otherUser);
    setUnreadCounts(prev => ({
      ...prev,
      [otherUser]: 0
    }));
  };

  const getPrivateMessages = (otherUser) => {
    const chatKey = [username, otherUser].sort().join('-');
    const messages = privateMessages[chatKey] || [];
    console.log('Getting messages for:', otherUser, 'chatKey:', chatKey, 'messages:', messages);
    return messages;
  };

  const getUnreadCount = (otherUser) => {
    return unreadCounts[otherUser] || 0;
  };

  const getAllUnreadCount = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <PrivateChatContext.Provider value={{
      privateMessages,
      sendPrivateMessage,
      getPrivateMessages,
      getUnreadCount,
      getAllUnreadCount,
      markAsRead
    }}>
      {children}
    </PrivateChatContext.Provider>
  );
}

export function usePrivateChat() {
  const context = useContext(PrivateChatContext);
  if (!context) {
    throw new Error('usePrivateChat must be used within a PrivateChatProvider');
  }
  return context;
} 