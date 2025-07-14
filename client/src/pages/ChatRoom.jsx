import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import socket from '../socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import MessageSearch from '../components/MessageSearch';
import TypingIndicator from '../components/TypingIndicator';
import useNotifications from '../hooks/useNotifications';
import UnreadBadge from '../components/UnreadBadge';
import Rooms from './Rooms';
import PrivateChat from './PrivateChat';
import { usePrivateChat } from '../context/PrivateChatContext';

function ChatRoom() {
  const { username, logout } = useAuth();
  const { onlineUsers, rooms, isConnected, connectionError } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [active, setActive] = useState(true);
  const messagesEndRef = useRef(null);
  const [currentRoom, setCurrentRoom] = useState('General');
  const currentRoomRef = useRef('General');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showPrivateConvo, setShowPrivateConvo] = useState(false);
  const [privateRecipient, setPrivateRecipient] = useState(null);
  const [deliveredIds, setDeliveredIds] = useState([]);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { unread, setUnread } = useNotifications({ messages, currentUser: username, chatActive: active });
  const { getAllUnreadCount } = usePrivateChat();

  // Update ref when currentRoom changes
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    // Join General room by default
    socket.emit('join-room', 'General');
  }, []);

  useEffect(() => {
    function handleMessage(msg) {
      // Only show messages for current room
      if (msg.room === currentRoomRef.current || !msg.room) {
        setMessages((prev) => [...prev, msg]);
      }
    }
    function handleTyping(user) {
      setTypingUsers((prev) => {
        if (!prev.includes(user)) return [...prev, user];
        return prev;
      });
    }
    function handleStopTyping(user) {
      setTypingUsers((prev) => prev.filter(u => u !== user));
    }
    function handleRoomJoined(roomName) {
      console.log('Joined room:', roomName);
      setCurrentRoom(roomName);
      setMessages([]); // Clear messages when switching rooms
    }
    function handleUserInvited(data) {
      console.log('User invited:', data);
      alert(`${data.user} has been invited to ${data.room}`);
    }
    
    socket.on('chat-message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);
    socket.on('room-joined', handleRoomJoined);
    socket.on('user-invited', handleUserInvited);
    
    return () => {
      socket.off('chat-message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
      socket.off('room-joined', handleRoomJoined);
      socket.off('user-invited', handleUserInvited);
    };
  }, []); // Remove currentRoom dependency

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const onFocus = () => {
      setActive(true);
      setUnread(0);
    };
    const onBlur = () => setActive(false);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [setUnread]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg._id && lastMsg.sender !== username) {
        socket.emit('read-receipt', { messageId: lastMsg._id, username, room: currentRoom });
      }
    }
  }, [messages, username, currentRoom]);

  const handleSend = (text) => {
    const msg = {
      sender: username,
      text,
      time: new Date(),
      room: currentRoom
    };
    socket.emit('chat-message', msg, (ack) => {
      if (ack && ack.status === 'delivered' && ack.id) {
        setDeliveredIds((prev) => [...prev, ack.id]);
      }
    });
    setMessages((prev) => [...prev, { ...msg }]);
  };

  const handleJoinRoom = (roomName) => {
    console.log('Joining room:', roomName);
    socket.emit('join-room', roomName);
    setCurrentRoom(roomName);
    setShowCreateRoom(false);
    setShowRoomManagement(false);
  };

  const handleLoadMoreMessages = async () => {
    // This would typically fetch older messages from the server
    console.log('Loading more messages...');
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const totalUnread = unread + getAllUnreadCount();

  console.log('isConnected:', isConnected);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-4 sm:p-8 rounded shadow-md w-full max-w-md sm:max-w-lg md:max-w-xl">
        {/* Connection Status */}
        {connectionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {connectionError}
          </div>
        )}
        
        {!isConnected && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Connecting to server...
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            {currentRoom}
            {totalUnread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {totalUnread} new
              </span>
            )}
          </h2>
          <UnreadBadge count={totalUnread} />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={logout} className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm">
            Logout
          </button>
          <button onClick={() => setShowCreateRoom(true)} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm">
            Create Room
          </button>
          <button onClick={() => setShowRoomManagement(true)} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm">
            Manage Rooms
          </button>
          <button onClick={() => setShowSearch(!showSearch)} className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm">
            {showSearch ? 'Hide' : 'Show'} Search
          </button>
          <button 
            onClick={() => setShowPrivateConvo(true)} 
            className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 relative text-sm"
          >
            Private Convo
            {getAllUnreadCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getAllUnreadCount()}
              </span>
            )}
          </button>
        </div>

        {/* Message Search */}
        {showSearch && (
          <MessageSearch messages={messages} />
        )}

        {/* Online Users */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Online Users:</h3>
          <ul className="list-disc list-inside text-sm">
            {onlineUsers.map((user, idx) => (
              <li key={idx} className={user === username ? 'font-bold text-blue-600 flex items-center' : 'flex items-center'}>
                <span className="mr-2">🟢</span>{user} {user === username && '(You)'}
              </li>
            ))}
          </ul>
        </div>

        <MessageList 
          messages={messages} 
          currentUser={username} 
          unreadCount={unread} 
          deliveredIds={deliveredIds}
          onLoadMore={handleLoadMoreMessages}
          currentRoom={currentRoom}
        />
        <TypingIndicator typingUsers={typingUsers} currentUser={username} />
        <div ref={messagesEndRef} />
        <MessageInput onSend={handleSend} username={username} />
        
        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowCreateRoom(false)}
              >
                &times;
              </button>
              <Rooms onJoinRoom={handleJoinRoom} />
            </div>
          </div>
        )}
        
        {/* Room Management Modal */}
        {showRoomManagement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowRoomManagement(false)}
              >
                &times;
              </button>
              <Rooms onJoinRoom={handleJoinRoom} />
            </div>
          </div>
        )}
        
        {/* Private Convo Modal */}
        {showPrivateConvo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => { setShowPrivateConvo(false); setPrivateRecipient(null); }}
              >
                &times;
              </button>
              {/* Simple user picker for private chat */}
              {!privateRecipient ? (
                <div>
                  <h3 className="font-semibold mb-2">Start Private Conversation</h3>
                  <ul>
                    {onlineUsers.filter(u => u !== username).map((user, idx) => (
                      <li key={idx}>
                        <button className="text-blue-600 underline" onClick={() => setPrivateRecipient(user)}>{user}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <PrivateChat recipient={privateRecipient} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatRoom; 