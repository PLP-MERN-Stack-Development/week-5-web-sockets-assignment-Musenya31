import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/UserList';
import PrivateChat from './PrivateChat';

function Rooms({ onJoinRoom }) {
  const { username } = useAuth();
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [showRooms, setShowRooms] = useState(false);
  const [activePrivateChatUser, setActivePrivateChatUser] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    socket.emit('get-rooms');
    socket.on('room-list', setRooms);
    socket.on('online-users', setOnlineUsers);
    socket.on('user-invited', (data) => {
      console.log('User invited event received:', data);
      setInviteMessage(`${data.user} has been invited to ${data.room}`);
      setTimeout(() => setInviteMessage(''), 3000);
    });
    socket.on('room-joined', (roomName) => {
      console.log('Room joined event received:', roomName);
      setSelectedRoom(roomName);
    });
    return () => {
      socket.off('room-list', setRooms);
      socket.off('online-users', setOnlineUsers);
      socket.off('user-invited');
      socket.off('room-joined');
    };
  }, []);

  const handleJoin = (roomName) => {
    console.log('Joining room:', roomName);
    setSelectedRoom(roomName);
    onJoinRoom(roomName);
    socket.emit('join-room', roomName);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      console.log('Creating room:', roomName.trim());
      const newRoomName = roomName.trim();
      setSelectedRoom(newRoomName);
      socket.emit('join-room', newRoomName);
      setRoomName('');
      setShowCreate(false);
      onJoinRoom(newRoomName);
    }
  };

  const handleInvite = (user) => {
    if (selectedRoom && user) {
      console.log('Inviting', user, 'to', selectedRoom);
      socket.emit('invite-to-room', { room: selectedRoom, user });
      // Show immediate feedback
      setInviteMessage(`Inviting ${user} to ${selectedRoom}...`);
      setTimeout(() => setInviteMessage(''), 2000);
    } else {
      console.error('Cannot invite: selectedRoom =', selectedRoom, 'user =', user);
    }
  };

  // Modal overlay for private chat
  const renderPrivateChatModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 w-96 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={() => setActivePrivateChatUser(null)}
        >
          &times;
        </button>
        <PrivateChat recipient={activePrivateChatUser} />
      </div>
    </div>
  );

  // Modal overlay for create room
  const renderCreateRoomModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 w-80 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={() => setShowCreate(false)}
        >
          &times;
        </button>
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
          <h3 className="font-semibold mb-2">Create New Room</h3>
          <input
            type="text"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            placeholder="Room name"
            className="border px-2 py-1 rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Room</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
      
      {inviteMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {inviteMessage}
        </div>
      )}
      
      <div className="flex gap-2 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowCreate(true)}
        >
          + Create Room
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => setShowRooms(!showRooms)}
        >
          {showRooms ? 'Hide' : 'Show'} All Rooms
        </button>
      </div>
      
      {showRooms && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Available Rooms:</h3>
          <ul className="space-y-2">
            {rooms.map((room, idx) => (
              <li key={idx}>
                <button 
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => handleJoin(room)}
                >
                  {room}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {selectedRoom && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Current Room: {selectedRoom}</h3>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Invite users to {selectedRoom}:</h4>
            {onlineUsers.filter(u => u !== username).length > 0 ? (
              <UserList
                users={onlineUsers}
                currentUser={username}
                onSelect={handleInvite}
                onPrivateMessage={user => setActivePrivateChatUser(user)}
              />
            ) : (
              <p className="text-gray-500">No other users online to invite</p>
            )}
          </div>
        </div>
      )}
      
      {!selectedRoom && (
        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <p className="text-yellow-700">Select a room to invite users</p>
        </div>
      )}
      
      {showCreate && renderCreateRoomModal()}
      {activePrivateChatUser && renderPrivateChatModal()}
    </div>
  );
}

export default Rooms; 