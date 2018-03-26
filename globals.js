'use strict';

global.MSG_COLOR = 'darkcyan';
global.DMG_COLOR = 'firebrick';
global.COMBAT_INTERVAL = 500;
global.SPAWNER_INTERVAL = 500;
global.DOOR_CLOSE_TIMER = 10000;

// todo: remove this when login functionality exists
global.STATES = {
  LOGIN_USERNAME: 0,
  LOGIN_PASSWORD: 1,
  MUD: 2,
};

global.offers = [];

// used by mob prototype
global.socketInRoom = function (roomId, socketId) {
  const ioRoom = global.io.sockets.adapter.rooms[roomId];
  return ioRoom && socketId in ioRoom.sockets;
};

// method for sending a message to all players in a room, except one.
// using the io.send instead of relying on the "sender" socket.
global.roomMessage = function (roomId, message, exclude) {
  const ioRoom = global.io.sockets.adapter.rooms[roomId];
  for (let socketId in ioRoom) {
    if (Array.isArray(exclude) && exclude.includes(socketId)) continue;
    ioRoom[socketId].emit('output', { message: message });
  }
};

global.GetSocketByUsername = (username) => {
  const sockets = Object.keys(global.io.sockets.sockets);
  let socket = null;
  sockets.forEach((socketId) => {
    let s = global.io.sockets.connected[socketId];
    if (s.user && s.user.username.toLowerCase() === username.toLowerCase()) {
      socket = s;
      return;
    }
  });
  return socket;
};

global.GetSocketByUserId = (userId) => {
  const sockets = Object.keys(global.io.sockets.sockets);
  let socket = null;
  sockets.forEach((socketId) => {
    let s = global.io.sockets.connected[socketId];
    if (s.user && s.user.id == userId) {
      socket = s;
      return;
    }
  });
  return socket;
};

global.getRandomNumber = function (min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min;
};

global.updateHUD = function (socket) {
  socket.emit('hud', {
    currentHP: socket.user.currentHP,
    maxHP: socket.user.maxHP,
  });
};


