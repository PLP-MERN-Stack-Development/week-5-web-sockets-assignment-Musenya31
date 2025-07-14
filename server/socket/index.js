const { Server } = require('socket.io');
const { addUser, removeUser, getOnlineUsers } = require('../models/users');
const { handleChatMessage } = require('../controllers/chat');
const { getRooms, addRoom, inviteToRoom, getRoomsForUser, roomMembers } = require('../controllers/rooms');
const { handlePrivateMessage } = require('../controllers/private');
const { handleFileMessage } = require('../controllers/files');
const { handleReadReceipt } = require('../controllers/receipts');
const { handleReaction } = require('../controllers/reactions');
const Message = require('../models/message');

function setupSocket(server) {
  const allowedOrigins = process.env.SOCKET_IO_ORIGIN
    ? process.env.SOCKET_IO_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (username) => {
      addUser(socket.id, username);
      socket.username = username;
      // Add user to General by default
      if (roomMembers.General) roomMembers.General.add(username);
      io.emit('online-users', getOnlineUsers());
      io.emit('chat-message', {
        sender: 'System',
        text: `${username} has joined the chat`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        system: true
      });
    });

    // Rooms
    socket.on('get-rooms', () => {
      console.log('Getting rooms for user:', socket.username);
      if (socket.username) {
        const userRooms = getRoomsForUser(socket.username);
        console.log('User rooms:', userRooms);
        socket.emit('room-list', userRooms);
      } else {
        const allRooms = getRooms();
        console.log('All rooms:', allRooms);
        socket.emit('room-list', allRooms);
      }
    });
    
    socket.on('join-room', (room) => {
      console.log('User', socket.username, 'joining room:', room);
      addRoom(room, socket.username);
      socket.join(room);
      if (socket.username) inviteToRoom(room, socket.username);
      
      // Emit room joined event to the user
      socket.emit('room-joined', room);
      
      // Emit system message to the room
      io.to(room).emit('chat-message', {
        sender: 'System',
        text: `${socket.username} has joined ${room}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        system: true,
        room: room
      });
      
      // Update room list for all users
      io.emit('room-list', getRooms());
    });
    
    socket.on('invite-to-room', ({ room, user }) => {
      console.log('Inviting', user, 'to room:', room);
      // Add the user to the room members
      inviteToRoom(room, user);
      // Emit invitation event to the invited user
      let userFound = false;
      for (let [id, s] of io.of('/').sockets) {
        console.log('Checking socket:', id, 'username:', s.username);
        if (s.username === user) {
          console.log('Found user socket, sending invitation to:', user);
          s.emit('room-list', getRoomsForUser(user));
          s.emit('user-invited', { room, user: socket.username });
          userFound = true;
          break;
        }
      }
      // Emit confirmation to the inviter
      socket.emit('user-invited', { room, user });
      if (!userFound) {
        console.log('User not found online:', user);
        socket.emit('user-invited', { room, user, status: 'offline' });
      }
      // Update room list for all users
      io.emit('room-list', getRooms());
    });

    // Private messaging
    socket.on('private-message', (msg) => {
      handlePrivateMessage(io, socket, msg);
    });

    // File/image sharing
    socket.on('file-message', async (msg) => {
      // Save file message to DB
      const saved = await Message.create(msg);
      io.to(msg.room).emit('file-message', saved);
    });

    // Read receipts
    socket.on('read-receipt', async ({ messageId, username, room }) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: username } });
      io.to(room).emit('read-receipt', { messageId, username });
    });

    // Message reactions
    socket.on('reaction', async ({ messageId, emoji, username, room }) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { [`reactions.${emoji}`]: username } });
      io.to(room).emit('reaction', { messageId, emoji, username });
    });

    // D. Delivery Acknowledgment
    socket.on('chat-message', async (msg, callback) => {
      const saved = await Message.create(msg);
      io.to(msg.room).emit('chat-message', saved);
      if (callback) callback({ status: 'delivered', id: saved._id });
    });

    socket.on('typing', (username) => {
      socket.broadcast.emit('typing', username);
    });

    socket.on('stop-typing', (username) => {
      socket.broadcast.emit('stop-typing', username);
    });

    socket.on('get-messages', async ({ room, before, limit = 20 }) => {
      const query = { room };
      if (before) query.time = { $lt: new Date(before) };
      const messages = await Message.find(query)
        .sort({ time: -1 })
        .limit(limit)
        .lean();
      socket.emit('messages', messages.reverse());
    });

    socket.on('disconnect', () => {
      const username = socket.username;
      removeUser(socket.id);
      io.emit('online-users', getOnlineUsers());
      if (username) {
        io.emit('chat-message', {
          sender: 'System',
          text: `${username} has left the chat`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          system: true
        });
      }
    });
  });
}

module.exports = { setupSocket }; 