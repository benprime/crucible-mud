'use strict';

const Room = require('./models/room');
const Item = require('./models/item');

// room cache
const rooms = {};

// fetch all rooms from server
Room.find({}, function(err, result) {
  result.forEach(function(room) {
    room.mobs = [];
    room.inventory = room.inventory.map(item => new Item(item));
    rooms[room.id] = room;
  });
});

module.exports = {
  getRoomById(roomId) {
      return rooms[roomId];
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
