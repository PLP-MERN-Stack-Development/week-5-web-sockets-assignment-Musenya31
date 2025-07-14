const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  recipient: String, // for private messages
  text: String,
  file: {
    name: String,
    type: String,
    url: String,
  },
  time: { type: Date, default: Date.now },
  readBy: [String],
  reactions: { type: Map, of: [String] }
});
module.exports = mongoose.model('Message', messageSchema); 