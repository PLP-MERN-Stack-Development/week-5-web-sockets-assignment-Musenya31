import { useEffect, useState } from 'react';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

export default function useSocket() {
  const { username } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (username) {
      socket.emit('join', username);
    }
    
    function handleOnlineUsers(users) {
      setOnlineUsers(users);
    }
    
    function handleRoomList(roomList) {
      setRooms(roomList);
    }
    
    function handleConnect() {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    }
    
    function handleDisconnect() {
      console.log('Disconnected from server');
      setIsConnected(false);
    }
    
    function handleConnectError(error) {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to server');
      setIsConnected(false);
    }
    
    function handleReconnect(attemptNumber) {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      // Re-join with username after reconnection
      if (username) {
        socket.emit('join', username);
      }
    }
    
    socket.on('online-users', handleOnlineUsers);
    socket.on('room-list', handleRoomList);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    
    return () => {
      socket.off('online-users', handleOnlineUsers);
      socket.off('room-list', handleRoomList);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
    };
  }, [username]);

  return { onlineUsers, rooms, isConnected, connectionError };
} 