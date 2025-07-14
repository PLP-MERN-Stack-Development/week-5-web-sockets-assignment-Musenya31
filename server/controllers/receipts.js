function handleReadReceipt(io, socket, receipt) {
  // Broadcast read receipt to sender
  for (let [id, s] of io.of('/').sockets) {
    if (s.username === receipt.sender) {
      s.emit('read-receipt', receipt);
      break;
    }
  }
}

module.exports = { handleReadReceipt }; 