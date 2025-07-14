const rooms = new Set(['General']);
const roomMembers = { General: new Set() };

function getRoomsForUser(username) {
  // Return rooms where user is a member or invited
  return Object.keys(roomMembers).filter(room => roomMembers[room].has(username));
}

function getRooms() {
  return Array.from(rooms);
}

function addRoom(room, creator) {
  rooms.add(room);
  if (!roomMembers[room]) roomMembers[room] = new Set();
  if (creator) roomMembers[room].add(creator);
}

function inviteToRoom(room, username) {
  if (!roomMembers[room]) roomMembers[room] = new Set();
  roomMembers[room].add(username);
}

module.exports = { getRooms, addRoom, inviteToRoom, getRoomsForUser, roomMembers }; 