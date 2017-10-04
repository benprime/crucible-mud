'use strict';

require('../extensionMethods');
const mongoose = require('mongoose');
const ItemSchema = require('./itemSchema');
const SpawnerSchema = require('./spawnerSchema');

//============================================================================
// Constants
//============================================================================
const dirEnum = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'];
const longToShort = {
  north: 'n',
  northeast: 'ne',
  east: 'e',
  southeast: 'se',
  south: 's',
  southwest: 'sw',
  west: 'w',
  northwest: 'nw',
  up: 'u',
  down: 'd',
};

//============================================================================
// Room Cache
//============================================================================
const rooms = {};

function LongToShort(dir) {
  if(dir in longToShort) return longToShort[dir];
  return dir;
}

//============================================================================
// Room Schema
//============================================================================
const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  desc: {
    type: String,
  },
  x: {
    type: Number,
  },
  y: {
    type: Number,
  },
  z: {
    type: Number,
  },
  exits: [{
    dir: {
      type: String,
      enum: dirEnum,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    closed: {
      type: Boolean,
    },
    keyName: {
      type: String,
    },
    locked: {
      type: Boolean,
    },

  }],

  spawner: SpawnerSchema,
  inventory: [ItemSchema],
});

//============================================================================
// Static methods
//============================================================================
RoomSchema.statics.getRoomById = function(roomId) {
  return rooms[roomId];
};

RoomSchema.statics.loadRooms = function() {
  this.find({}, function (err, result) {
    result.forEach(function (room) {
      room.mobs = [];
      rooms[room.id] = room;
    });
  });
};

RoomSchema.statics.roomsWithMobs = function() {
  return Object.values(rooms).filter(r => r.mobs.length > 0);
};

RoomSchema.statics.roomsWithSpawners = function() {
  return Object.values(rooms).filter(r => r.spawner && r.spawner.timeout);
};

RoomSchema.statics.oppositeDirection = function (dir) {
  switch (dir) {
    case 'n':
      return 's';
    case 'ne':
      return 'sw';
    case 'e':
      return 'w';
    case 'se':
      return 'nw';
    case 's':
      return 'n';
    case 'sw':
      return 'ne';
    case 'w':
      return 'e';
    case 'nw':
      return 'se';
    case 'u':
      return 'd';
    case 'd':
      return 'u';
    default:
      return 'WHAT';
  }
};

RoomSchema.statics.byCoords = function (coords, cb) {
  return this.findOne({ x: coords.x, y: coords.y, z: coords.z }, cb);
};

RoomSchema.statics.exitName = function (dir) {
  switch (dir) {
    case 'n':
      return 'north';
    case 'ne':
      return 'northeast';
    case 'e':
      return 'east';
    case 'se':
      return 'southeast';
    case 's':
      return 'south';
    case 'sw':
      return 'southwest';
    case 'w':
      return 'west';
    case 'nw':
      return 'northwest';
    case 'u':
      return 'up';
    case 'd':
      return 'down';
    default:
      return 'INVALID_DIRECTION';
  }
};

RoomSchema.statics.ValidDirectionInput = function(dir) {
  let input = dir.toLowerCase();
  input = LongToShort(input);
  switch (input) {
    case 'n':
    case 'ne':
    case 'e':
    case 'se':
    case 's':
    case 'sw':
    case 'w':
    case 'nw':
    case 'u':
    case 'd':
      return input;
    default:
      return null;
  }
};

//============================================================================
// Instance methods
//============================================================================
RoomSchema.methods.SocketInRoom = function (socketId) {
  if (!(this.id in global.io.sockets.adapter.rooms)) {
    return false;
  }
  const sockets = global.io.sockets.adapter.rooms[this.id].sockets;
  return socketId in sockets;
};

RoomSchema.methods.UsersInRoom = function () {
  if (!(this.id in global.io.sockets.adapter.rooms)) {
    return [];
  }

  const clients = global.io.sockets.adapter.rooms[this.id].sockets;
  const otherUsers = Object.keys(clients);

  // return array of string usernames
  return otherUsers.map(socketId => global.io.sockets.connected[socketId].user.username);
};

RoomSchema.methods.UserInRoom = function (username) {
  let usernames = this.UsersInRoom(this.RoomId);
  usernames = usernames.map(u => u.toLowerCase());
  return usernames.indexOf(username.toLowerCase()) > -1;
};

RoomSchema.methods.createRoom = function (dir, cb) {
  if (!Room.ValidDirectionInput(dir)) {
    return false;
  }

  let exit = this.getExit(dir);
  if (exit) {
    return false;
  }

  // see if room exists at the coords
  var targetCoords = this.dirToCoords(dir);

  Room.byCoords(targetCoords, function (targetRoom) {
    const oppDir = Room.oppositeDirection(dir);
    if (targetRoom) {
      this.addExit(dir, targetRoom.id);
      targetRoom.addExit(oppDir, this.id);
      this.save();
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
          roomId: this.id,
        }],
      });

      targetRoom.mobs = [];

      // update this room with exit to new room
      targetRoom.save(function (err, updatedRoom) {
        
        // add new room to room cache
        rooms[updatedRoom.id] = updatedRoom;

        this.addExit(dir, updatedRoom.id);
        this.save();
        if (cb) cb();
      });
    }
  });
};

RoomSchema.methods.getSockets = function () {
  const ioRoom = global.io.sockets.adapter.rooms[this.id];
  if (!ioRoom) return [];
  return Object.keys(ioRoom.sockets).map((socketId) => global.io.sockets.connected[socketId]);
};

RoomSchema.methods.Look = function (socket, short) {
  let output = `<span class='cyan'>${this.name}</span>\n`;

  if (!short) {
    output += `<span class='silver'>${this.desc}</span>\n`;
  }

  if (this.inventory && this.inventory.length > 0) {
    output += `<span class='darkcyan'>You notice: ${this.inventory.map(item => item.displayName).join(', ')}.</span>\n`;
  }

  let names = this.UsersInRoom(this.id).filter(name => name !== socket.user.username);

  console.log('Users in room names: ', names);

  const mobNames = this.mobs.map(mob => mob.displayName + ' ' + mob.hp);
  if (mobNames) { names = names.concat(mobNames); }
  const displayNames = names.join('<span class=\'mediumOrchid\'>, </span>');

  if (displayNames) {
    output += `<span class='purple'>Also here: <span class='teal'>${displayNames}</span>.</span>\n`;
  }

  if (this.exits.length > 0) {
    output += `<span class='green'>Exits: ${this.exits.map(exit => Room.exitName(exit.dir)).join(', ')}</span>\n`;
  }

  if (!short && socket.user.admin) {
    output += `<span class='gray'>Room ID: ${this.id}</span>\n`;
  }

  socket.emit('output', { message: output });
};

RoomSchema.methods.getMobById = function (mobId) {
  return this.mobs.find(m => m.id === mobId);
};

RoomSchema.methods.dirToCoords = function (dir) {

  let x = this.x;
  let y = this.y;
  let z = this.z;

  if (dir.includes('e')) x += 1;
  if (dir.includes('w')) x -= 1;
  if (dir.includes('n')) y += 1;
  if (dir.includes('s')) y -= 1;
  if (dir.includes('u')) z += 1;
  if (dir.includes('d')) z -= 1;

  return { x, y, z };
};

RoomSchema.methods.getExit = function (dir) {
  const ldir = dir.toLowerCase();
  return this.exits.find(e => e.dir === ldir);
};

RoomSchema.methods.addExit = function (dir, roomId) {
  const ldir = dir.toLowerCase();
  const exit = this.getExit(ldir);
  if (exit) {
    return false;
  }
  this.exits.push({
    dir: ldir,
    roomId: roomId,
  });
  return true;
};


const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
