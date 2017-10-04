'use strict';

global.MSG_COLOR = 'darkcyan';
global.DMG_COLOR = 'firebrick';
global.COMBAT_INTERVAL = 500;
global.SPAWNER_INTERVAL = 500;

// todo: remove this when login functionality exists
global.STATES = {
  LOGIN_USERNAME: 0,
  LOGIN_PASSWORD: 1,
  MUD: 2,
};

global.offers = [];


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


