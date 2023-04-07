const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
   
    room: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;