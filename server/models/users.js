const users = new Map(); // socketId -> username

function addUser(socketId, username) {
  users.set(socketId, username);
}

function removeUser(socketId) {
  users.delete(socketId);
}

function getOnlineUsers() {
  return Array.from(users.values());
}

module.exports = {
  addUser,
  removeUser,
  getOnlineUsers,
}; 