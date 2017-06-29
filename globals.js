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

global.SocketInRoom = function (roomId, socketId) {
  if (!(roomId in global.io.sockets.adapter.rooms)) {
    return false;
  }
  const sockets = global.io.sockets.adapter.rooms[roomId].sockets;
  return socketId in sockets;
};

global.UsersInRoom = function (roomId) {
  if (!(roomId in global.io.sockets.adapter.rooms)) {
    return [];
  }

  const clients = global.io.sockets.adapter.rooms[roomId].sockets;
  const otherUsers = Object.keys(clients);

  // return array of string usernames
  return otherUsers.map(socketId => global.io.sockets.connected[socketId].user.username);
};

global.UserInRoom = function (roomId, username) {
  let usernames = global.UsersInRoom(roomId);
  usernames = usernames.map(u => u.toLowerCase());
  return usernames.indexOf(username.toLowerCase()) > -1;
};

global.FilterMatch = (array, pattern) => {
  const re = new RegExp(`^${pattern}`, 'i');
  return array.filter(value => !!re.exec(value));
};

global.AutocompleteName = (socket, nameString, list) => {
  const name = nameString.trim().toLowerCase();

  // (if there are two or more of the same creature, we just pick the first one)
  const uniqueList = list.filter((item, i, list) => list.indexOf(item) === i);
  const filteredNames = global.FilterMatch(uniqueList, name);

  return filteredNames;
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

global.LongToShort = function (dir) {
  switch (dir) {
    case 'north':
      return 'n';
    case 'northeast':
      return 'ne';
    case 'east':
      return 'e';
    case 'southeast':
      return 'se';
    case 'south':
      return 's';
    case 'southwest':
      return 'sw';
    case 'west':
      return 'w';
    case 'northwest':
      return 'nw';
    case 'up':
      return 'u';
    case 'down':
      return 'd';
    default:
      return dir;
  }
};

// this is for database inputs and such
global.ValidDirection = function (dir) {
  const validDirections = Room.schema.path('dir').enumValues;
  return validDirections.indexOf(dir) >= 0;
};

// this is for user input
global.ValidDirectionInput = function (dir) {
  switch (dir.toLowerCase()) {
    case 'n':
    case 'north':
    case 'ne':
    case 'northeast':
    case 'e':
    case 'east':
    case 'se':
    case 'southeast':
    case 's':
    case 'south':
    case 'sw':
    case 'southwest':
    case 'w':
    case 'west':
    case 'nw':
    case 'northwest':
    case 'u':
    case 'up':
    case 'd':
    case 'down':
      return true;
    default:
      return false;
  }
};

global.getRandomNumber = function (min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min;
};

global.updateHUD = function (socket) {
  socket.emit('hud', {
    currentHP: socket.user.currentHP,
    maxHP: socket.user.maxHP
  });
};