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
    maxHP: socket.user.maxHP,
  });
};

global.filterMatch = function (array, pattern) {
  const re = new RegExp(`^${pattern}`, 'i');
  const matches = array.filter(value => !!re.exec(value));

  // return unique matches only
  return matches.filter((item, i, matches) => matches.indexOf(item) === i);
};

global.CurrencyChangeToString = function (totalCurr) {
  if (totalCurr < 0) return 'You are in debt';
  if (totalCurr == 0) return '0 Copper';

  let currStr = '';
  let t = totalCurr;

  let pp = Math.floor(t / 1000);
  t -= pp * 1000;
  let gp = Math.floor(t / 100);
  t -= gp * 100;
  let sp = Math.floor(t / 10);
  t -= sp * 10;
  let cp = Math.floor(t / 1);
  t -= cp * 1;

  if (pp > 0) currStr += `${pp} Platinum `;
  if (gp > 0) currStr += `${gp} Gold `;
  if (sp > 0) currStr += `${sp} Silver `;
  if (cp > 0) currStr += `${cp} Copper`;

  return currStr;
};

global.CurrencyChangeToInt = function (currStr) {
  if (!currStr) return 'No currency text';

  let parts = currStr.split(" ");
  let totalCurr = 0;

  if (parts.length == 1 && Number.isInteger(parts[x])) return parts[x];

  for (var x = 0; x < parts.length - 1; x += 2) {
    if (parts[x] === 0) continue;
    if (!Number.isInteger(parts[x])) return 0;

    if (parts[x + 1].toLowerCase() === 'platinum'
      || parts[x + 1].toLowerCase() === 'plat'
      || parts[x + 1].toLowerCase() === 'pp'
      || parts[x + 1].toLowerCase() === 'p') {
      totalCurr += parts[x] * 1000;
    }
    else if (parts[x + 1].toLowerCase() === 'gold'
      || parts[x + 1].toLowerCase() === 'gp'
      || parts[x + 1].toLowerCase() === 'g') {
      totalCurr += parts[x] * 100;
    }
    else if (parts[x + 1].toLowerCase() === 'silver'
      || parts[x + 1].toLowerCase() === 'silv'
      || parts[x + 1].toLowerCase() === 'sp'
      || parts[x + 1].toLowerCase() === 's') {
      totalCurr += parts[x] * 10;
    }
    else if (parts[x + 1].toLowerCase() === 'copper'
      || parts[x + 1].toLowerCase() === 'copp'
      || parts[x + 1].toLowerCase() === 'cp'
      || parts[x + 1].toLowerCase() === 'c') {
      totalCurr += parts[x] * 1;
    }
  }

  return totalCurr;
};