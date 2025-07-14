// Placeholder for future chat logic (e.g., saving messages to DB)

function handleChatMessage(io, socket, msg) {
  // Broadcast the message to all clients except the sender
  socket.broadcast.emit('chat-message', msg);
}

module.exports = { handleChatMessage }; 