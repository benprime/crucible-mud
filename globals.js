'use strict';

// todo: remove this when login functionality exists
global.STATES = {
  LOGIN_USERNAME: 0,
  LOGIN_PASSWORD: 1,
  MUD: 2,
};

global.UsersInRoom = function(roomId) {
  if (!(roomId in global.io.sockets.adapter.rooms)) {
    return [];
  }

  //let ioRoom = global.io.sockets.adapter.rooms[socket.roomId];

  // room should never be undefined here because, socket is in room.
  const clients = global.io.sockets.adapter.rooms[roomId].sockets;

  // remove current user
  //const otherUsers = Object.keys(clients).filter(socketId => socketId !== socket.id);

  const usernames = clients.map(socket => socket.user.username);

  //const usernames = otherUsers.map(socketId => otherUsers[socketId].user.username);
  return usernames;
};

global.UserInRoom = function(socket, username) {
  if (!(socket.user.roomId in global.io.sockets.adapter.rooms)) {
    return false;
  }
  const clients = global.io.sockets.adapter.rooms[socket.user.roomId].sockets;

  // remove current user
  const otherUsers = Object.keys(clients).filter(socketId => socketId !== socket.id);

  const usernames = otherUsers.map(socketId => otherUsers[socketId].user.username);
  return usernames.indexOf(username) > -1;
};

global.FilterMatch = (array, pattern) => {
  const re = new RegExp(`^${pattern}`, 'i');
  return array.filter(value => !!re.exec(value));
};

global.ResolveName = (socket, nameString, list) => {
  const name = nameString.trim().toLowerCase();
  //console.log("nameString", nameString);

  //console.log("list", JSON.stringify(list));
  // (if there are two or more of the same creature, we just pick the first one)
  const uniqueMobNameList = list.filter((item, i, list) => list.indexOf(item) === i);
  //console.log("uniqueMobNameList", JSON.stringify(uniqueMobNameList));
  const filteredNames = module.exports.FilterMatch(uniqueMobNameList, name);
  //console.log("filteredNames", JSON.stringify(filteredNames));

  if (filteredNames.length > 1) {
    socket.emit('output', { message: 'Not specific enough!' });
    return null;
  } else if (filteredNames.length === 0) {
    socket.emit('output', { message: 'You don\'t see that here!' });
    return null;
  }
  // got it
  return filteredNames[0];
};

global.GetSocketByUsername = (username) => {
  const sockets = Object.keys(global.io.sockets.sockets);
  const socket = sockets.find(s => s.user.username.toLowerCase() === username.toLowerCase());
  return socket;
};


global.LongToShort = function(dir) {
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
global.ValidDirection = function(dir) {
  const validDirections = Room.schema.path('dir').enumValues;
  return validDirections.indexOf(dir) >= 0;
};

// this is for user input
global.ValidDirectionInput = function(dir) {
  switch (dir) {
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
