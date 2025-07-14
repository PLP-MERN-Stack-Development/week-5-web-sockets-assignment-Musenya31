function handlePrivateMessage(io, socket, msg) {
  console.log('Server received private message:', msg);
  console.log('Sender socket username:', socket.username);
  
  // Find recipient socket and emit
  let recipientFound = false;
  for (let [id, s] of io.of('/').sockets) {
    console.log('Checking socket:', id, 'username:', s.username, 'target:', msg.recipient);
    if (s.username === msg.recipient) {
      console.log('Found recipient, sending message to socket:', id);
      s.emit('private-message', msg);
      recipientFound = true;
      break;
    }
  }
  
  // Also emit back to sender for confirmation
  console.log('Sending confirmation back to sender');
  socket.emit('private-message', msg);
  
  // If recipient is not online, emit a system message to sender
  if (!recipientFound) {
    console.log('Recipient not found, sending offline message');
    socket.emit('private-message', {
      sender: 'System',
      text: `${msg.recipient} is not online`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      system: true
    });
  }
}

module.exports = { handlePrivateMessage }; 