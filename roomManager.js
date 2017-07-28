'use strict';

const Room = require('./models/room');

// room cache
const rooms = {};

// fetch all rooms from server
Room.find({}, function (err, result) {
  result.forEach(function (room) {
    room.mobs = [];
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
  },

  roomsWithSpawners() {
    return Object.keys(rooms).reduce(function (filtered, key) {
      if (rooms[key].spawner && rooms[key].spawner.timeout) {
        filtered.push(rooms[key]);
      }
      return filtered;
    }, []);
  },
};
