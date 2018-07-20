'use strict';

const mongoose = require('mongoose');
const ItemSchema = require('./itemSchema');
const SpawnerSchema = require('./spawnerSchema');
const socketUtil = require('../core/socketUtil');

const roomCache = {};

//============================================================================
// Direction Support
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

const shortToLong = {
  n: 'north',
  ne: 'northeast',
  e: 'east',
  se: 'southeast',
  s: 'south',
  sw: 'southwest',
  w: 'west',
  nw: 'northwest',
  u: 'up',
  d: 'down',
};

const oppositeDir = {
  n: 's',
  ne: 'sw',
  e: 'w',
  se: 'nw',
  s: 'n',
  sw: 'ne',
  w: 'e',
  nw: 'se',
  u: 'd',
  d: 'u',
};

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
  alias: {
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

  // TODO: This may make more sense to be an object instead of a list
  // with the direction as the key.
  exits: [{
    dir: {
      type: String,
      enum: dirEnum,
    },
    roomId: {
      // TODO: this type may need to be a string.
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
    hidden: {
      type: Boolean,
    },
  }],
  spawner: SpawnerSchema,
  inventory: [ItemSchema],
});

//============================================================================
// Statics
//============================================================================
RoomSchema.statics.roomCache = roomCache;

RoomSchema.statics.getById = roomId => {
  var room = roomCache[roomId];
  return room;
};

RoomSchema.statics.oppositeDirection = dir => {
  if (dir in oppositeDir) return oppositeDir[dir];
  return null;
};

RoomSchema.statics.byCoords = function (coords, cb) {
  return this.findOne(coords, cb);
};

RoomSchema.statics.shortToLong = dir => {
  if (dir in shortToLong) return shortToLong[dir];
  return dir;
};

RoomSchema.statics.longToShort = dir => {
  if (dir in longToShort) return longToShort[dir];
  return dir;
};

RoomSchema.statics.validDirectionInput = function (dir) {
  const input = this.longToShort(dir.toLowerCase());
  if (dirEnum.includes(input)) return input;
  return null;
};

//============================================================================
// Instance methods
//============================================================================
RoomSchema.methods.usersInRoom = function () {

  const ioRoom = global.io.sockets.adapter.rooms[this.id];
  if (!ioRoom) {
    return [];
  }

  const otherUsers = Object.keys(ioRoom.sockets);
  return otherUsers.map(socketId => global.io.sockets.connected[socketId].user.username);
};

// Candidate for static method.
RoomSchema.methods.userInRoom = function (username) {
  let usernames = this.usersInRoom(this.RoomId);
  usernames = usernames.map(u => u.toLowerCase());
  return usernames.indexOf(username.toLowerCase()) > -1;
};

RoomSchema.methods.createRoom = function (dir, cb) {
  const self = this;
  if (!Room.validDirectionInput(dir)) {
    cb(false);
    return;
  }

  let exit = self.getExit(dir);
  if (exit) {
    cb(false);
    return;
  }

  // see if room exists at the coords
  var targetCoords = self.dirToCoords(dir);

  Room.byCoords(targetCoords, targetRoom => {
    const oppDir = Room.oppositeDirection(dir);
    if (targetRoom) {
      self.addExit(dir, targetRoom.id);
      targetRoom.addExit(oppDir, self.id);
      self.save();
      targetRoom.save();
      if (cb) cb(targetRoom);
    } else {
      // if room does not exist, create a new room
      // with an exit to this room
      targetRoom = new Room({
        name: 'Default Room Name',
        desc: 'Room Description',
        alias: null,
        x: targetCoords.x,
        y: targetCoords.y,
        z: targetCoords.z,
        exits: [{
          dir: oppDir,
          roomId: self.id,
        }],
      });

      targetRoom.mobs = [];

      // update this room with exit to new room
      targetRoom.save((err, updatedRoom) => {

        // add new room to room cache
        roomCache[updatedRoom.id] = updatedRoom;

        self.addExit(dir, updatedRoom.id);
        self.save();
        if (cb) cb(updatedRoom);
      });
    }
  });
};

RoomSchema.methods.look = function (socket, short) {
  let output = `<span class="cyan">${this.name}</span>\n`;

  if (!short) {
    output += `<span class="silver">${this.desc}</span>\n`;
  }

  var notHiddenItems = '', hiddenItems = '';
  if(this.inventory) {
    notHiddenItems = this.inventory.filter(item => !item.hidden).map(item => item.displayName).join(', ');
    hiddenItems = this.inventory.filter(item => item.hidden).map(item => item.displayName).join(', ');
  }
  if (notHiddenItems != '') {
    output += `<span class="darkcyan">You notice: ${notHiddenItems}.</span>\n`;
  }
  if (socket.user.admin && hiddenItems != '') {
    output += `<span class="olive">Hidden items: ${hiddenItems}.</span>\n`;
  }

  let names = this.usersInRoom(this.id).filter(name => name !== socket.user.username);

  const mobNames = this.mobs.map(mob => mob.displayName + ' ' + mob.hp);
  if (mobNames) { names = names.concat(mobNames); }
  const displayNames = names.join('<span class="mediumOrchid">, </span>');

  if (displayNames) {
    output += `<span class="purple">Also here: <span class="teal">${displayNames}</span>.</span>\n`;
  }

  var notHiddenExits = '', hiddenExits = '';
  if(this.exits) {
    notHiddenExits = this.exits.filter(exit => !exit.hidden).map(exit => Room.shortToLong(exit.dir)).join(', ');
    hiddenExits = this.exits.filter(exit => exit.hidden).map(exit => Room.shortToLong(exit.dir)).join(', ');
  }
  if (notHiddenExits != '') {
    output += `<span class="green">Exits: ${notHiddenExits}</span>\n`;
  }
  if (socket.user.admin && hiddenExits != '') {
    output += `<span class="firebrick">Hidden exits: ${hiddenExits}</span>\n`;
  }

  if (!short && socket.user.admin) {
    output += `<span class="gray">Room ID: ${this.id}</span>\n`;
    if (this.alias) output += `<span class="gray">Alias: ${this.alias}</span>\n`;
  }

  socket.emit('output', { message: output });
};

RoomSchema.methods.getMobById = function (mobId) {
  if (!this.mobs) return;
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

// make it clear this is an internal methoid (maybe make this private)
// it does not save anything to database
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

//============================================================================
// Instance methods : Combat
//============================================================================
RoomSchema.methods.processPlayerCombatActions = function (now) {
  const sockets = socketUtil.getRoomSockets(this.id);
  for (let socket of sockets) {
    if (!socket.user.attackTarget) continue;
    let mob = this.getMobById(socket.user.attackTarget);
    if (!mob) continue;
    socket.user.attack(socket, mob, now);
  }
};

RoomSchema.methods.processMobCombatActions = function (now) {
  if (Array.isArray(this.mobs) && this.mobs.length > 0) {
    const room = this;
    this.mobs.forEach(mob => {
      if (!mob.attack(now)) {
        mob.selectTarget(room.id, mob);
      }
      mob.taunt(now);
    });
  }
};

const Room = mongoose.model('Room', RoomSchema);

// populate cache
((() => {
  Room.find({}, (err, result) => {
    result.forEach(room => {
      room.mobs = [];
      roomCache[room.id] = room;
      if (room.alias)
        roomCache[room.alias] = room;
    });
  });
}))();

module.exports = Room;
