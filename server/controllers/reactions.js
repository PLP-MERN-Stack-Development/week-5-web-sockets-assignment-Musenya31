function handleReaction(io, socket, reaction) {
  // Broadcast reaction to room or recipient
  if (reaction.room) {
    io.to(reaction.room).emit('reaction', reaction);
  } else if (reaction.recipient) {
    for (let [id, s] of io.of('/').sockets) {
      if (s.username === reaction.recipient) {
        s.emit('reaction', reaction);
        break;
      }
    }
  }
}

module.exports = { handleReaction }; 