import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrivateChat } from '../context/PrivateChatContext';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

function PrivateChat({ recipient }) {
  const { username } = useAuth();
  const { getPrivateMessages, sendPrivateMessage, getUnreadCount, markAsRead } = usePrivateChat();
  const messagesEndRef = useRef(null);
  
  const messages = getPrivateMessages(recipient);
  const unreadCount = getUnreadCount(recipient);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when chat is opened
    if (recipient) {
      markAsRead(recipient);
    }
  }, [recipient, markAsRead]);

  const handleSend = (text) => {
    sendPrivateMessage(recipient, text);
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">
        Chat with {recipient}
        {unreadCount > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {unreadCount} new
          </span>
        )}
      </h2>
      <MessageList messages={messages} currentUser={username} unreadCount={unreadCount} />
      <div ref={messagesEndRef} />
      <MessageInput onSend={handleSend} username={username} />
    </div>
  );
}

export default PrivateChat; 