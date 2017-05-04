'use strict';

const roomModel = require('./models/room.js');
const Item = require('./models/item');

// room cache
const rooms = {};

module.exports = {
  getRoomById(roomId, cb) {
    if (roomId in rooms) {
      console.log("found room in cache");
      cb(rooms[roomId]);
      return;
    }

    return roomModel.findById(roomId, function (err, room) {
      console.log("room lookup");
      if (err) {
        console.log(err);
        return;
      }

      if (room) {
        rooms[roomId] = room;
        room.mobs = [];
        room.inventory = room.inventory.map(item => new Item(item));
      }

      cb(room);
    });

  },

  roomsWithMobs() {
    return Object.keys(rooms).reduce(function (filtered, key) {
      if (rooms[key].mobs.length > 0) {
        filtered.push(rooms[key]);
      }
      return filtered;
    }, []);

  }
  //rooms: rooms,
};
