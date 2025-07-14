function handleFileMessage(io, socket, msg) {
  // Broadcast file message to room or recipient
  if (msg.room) {
    io.to(msg.room).emit('file-message', msg);
  } else if (msg.recipient) {
    for (let [id, s] of io.of('/').sockets) {
      if (s.username === msg.recipient) {
        s.emit('file-message', msg);
        break;
      }
    }
  }
}

module.exports = { handleFileMessage }; 