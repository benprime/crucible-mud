'use strict';

const Room = require('./models/room');

// room cache
const rooms = {};

// fetch all rooms from server
function loadRooms() {
  Room.find({}, function (err, result) {
    result.forEach(function (room) {
      room.mobs = [];
      rooms[room.id] = room;
    });
  });
}

function createRoom(fromRoom, dir, cb) {
  if (!global.ValidDirectionInput(dir)) {
    return false;
  }

  let exit = fromRoom.getExit(dir);
  if (exit) {
    return false;
  }

  // see if room exists at the coords
  var targetCoords = fromRoom.dirToCoords(dir);

  Room.byCoords(targetCoords, function (targetRoom) {
    const oppDir = Room.oppositeDirection(dir);
    if (targetRoom) {
      fromRoom.addExit(dir, targetRoom.id);
      targetRoom.addExit(oppDir, fromRoom.id);
      fromRoom.save();
      targetRoom.save();
      if (cb) cb();
    } else {
      // if room does not exist, create a new room
      // with an exit to this room
      targetRoom = new Room({
        name: 'Default Room Name',
        desc: 'Room Description',
        x: targetCoords.x,
        y: targetCoords.y,
        z: targetCoords.z,
        exits: [{
          dir: oppDir,
          roomId: fromRoom.id,
        }],
      });

      targetRoom.mobs = [];

      // update this room with exit to new room
      targetRoom.save(function (err, updatedRoom) {
        // add new room to room manager
        rooms[updatedRoom.id] = updatedRoom;

        fromRoom.addExit(dir, updatedRoom.id);
        fromRoom.save();
        if (cb) cb();
      });

    }

  });
}

module.exports = {
  getRoomById(roomId) {
    return rooms[roomId];
  },

  roomsWithMobs() {
    return Object.Values(rooms).filter(r => r.mobs.length > 0);
  },


  roomsWithSpawners() {
    return Object.Values(rooms).filter(r => r.spawner && r.spawner.timeout);
  },

  createRoom,
  loadRooms,
};
