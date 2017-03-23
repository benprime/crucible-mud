'use strict';

const roomModel = require('./models/room.js');

// room cache
const rooms = {};

module.exports = {
  getRoomById(roomId, cb) {
    if (roomId in rooms) {
      cb(rooms[roomId]);
    }

    return roomModel.findById(roomId, function(err, room) {
      rooms[roomId] = room;
      if (err) {
        console.log(err);
        return;
      }

      if(!room) {
        console.log("ROOM NOT FOUND: " + roomId);
      }


      // initialize state members not persisted to database
      room.mobs = [];

      cb(room);
    });

  },
  updateRoomState(room) {
    rooms[room._id] = room;
  }
}
