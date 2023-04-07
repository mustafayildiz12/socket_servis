const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  username: { type: String, required:true },
  room: {type: String, required: true},
  text: { type: String, required: true },
  id: {type: String, required: true},
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
