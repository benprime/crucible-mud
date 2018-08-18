import mongoose from 'mongoose';
import ItemSchema from './itemSchema';
import ExitSchema from './exitSchema';
import Exit from './exit';
import Area from './area';
import SpawnerSchema from './spawnerSchema';
import socketUtil from '../core/socketUtil';

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
  area: {
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

  exits: [ExitSchema],

  spawner: SpawnerSchema,
  inventory: [ItemSchema],
}, { usePushEach: true });

//============================================================================
// Statics
//============================================================================
RoomSchema.statics.roomCache = roomCache;

RoomSchema.statics.getById = roomId => {
  const room = roomCache[roomId];
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

RoomSchema.statics.populateRoomCache = function () {
  this.find({}, (err, result) => {
    if (err) throw err;

    result.forEach(room => {
      room.mobs = [];
      roomCache[room.id.toString()] = room;
      if (room.alias)
        roomCache[room.alias] = room;
    });
  });
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
  return usernames.includes(username.toLowerCase());
};

RoomSchema.methods.createRoom = function (dir, cb) {
  const currentRoom = this;
  if (!this.constructor.validDirectionInput(dir)) {
    cb(false);
    return;
  }

  let exit = currentRoom.getExit(dir);
  if (exit) {
    cb(false);
    return;
  }

  // see if room exists at the coords
  const targetCoords = currentRoom.dirToCoords(dir);

  currentRoom.constructor.byCoords(targetCoords, targetRoom => {
    const oppDir = this.constructor.oppositeDirection(dir);
    if (targetRoom) {
      currentRoom.addExit(dir, targetRoom.id);
      targetRoom.addExit(oppDir, currentRoom.id);
      currentRoom.save(err => { if (err) throw err; });
      targetRoom.save(err => { if (err) throw err; });
      if (cb) cb(targetRoom);
    } else {
      // if room does not exist, create a new room
      // with an exit to this room
      targetRoom = new this.constructor({
        name: 'Default Room Name',
        desc: 'Room Description',
        x: targetCoords.x,
        y: targetCoords.y,
        z: targetCoords.z,
        exits: [{
          dir: oppDir,
          roomId: currentRoom.id,
        }],
      });

      if (currentRoom.area) {
        targetRoom.area = currentRoom.area;
      }

      // update this room with exit to new room
      targetRoom.save((err, updatedRoom) => {

        if (err) throw err;

        // add new room to room cache
        targetRoom.mobs = [];
        roomCache[updatedRoom.id] = updatedRoom;

        currentRoom.addExit(dir, updatedRoom.id);

        currentRoom.save(function (err) {
          if (err) throw err;
        });
        if (cb) cb(updatedRoom);
      });
    }
  });
};

RoomSchema.methods.look = function (socket, short) {

  let output = `<span class="cyan">${this.name}`;

  if (this.area) {
    output += `, ${Area.getById(this.area).name}`;
  }

  output += '</span>\n';

  if (!short) {
    output += `<span class="silver">${this.desc}</span>\n`;
  }

  let notHiddenItems = '';
  let hiddenItems = '';
  if (this.inventory) {
    notHiddenItems = this.inventory.filter(({ hidden }) => !hidden).map(({ displayName }) => displayName).join(', ');
    hiddenItems = this.inventory.filter(({ hidden }) => hidden).map(({ displayName }) => displayName).join(', ');
  }
  if (notHiddenItems != '') {
    output += `<span class="darkcyan">You notice: ${notHiddenItems}.</span>\n`;
  }
  if (socket.user.admin && hiddenItems != '') {
    output += `<span class="olive">Hidden items: ${hiddenItems}.</span>\n`;
  }

  let names = this.usersInRoom(this.id).filter(name => name !== socket.user.username);

  const mobNames = this.mobs.map(({ displayName, hp }) => `${displayName} ${hp}`);
  if (mobNames) { names = names.concat(mobNames); }
  const displayNames = names.join('<span class="mediumOrchid">, </span>');

  if (displayNames) {
    output += `<span class="purple">Also here: <span class="teal">${displayNames}</span>.</span>\n`;
  }

  let notHiddenExits = '';
  let hiddenExits = '';
  if (this.exits) {
    notHiddenExits = this.exits.filter(({ hidden }) => !hidden).map(({ dir }) => {
      let exitName = this.constructor.shortToLong(dir);
      const exit = this.exits.find(e => e.dir === dir);
      if(exit.closed) {
        exitName += ' (closed)';
      }
      return exitName;
    }).join(', ');
    hiddenExits = this.exits.filter(({ hidden }) => hidden).map(({ dir }) => this.constructor.shortToLong(dir)).join(', ');
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
  return this.mobs.find(({ id }) => id === mobId);
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

  const e = new Exit({
    dir: ldir,
    roomId: roomId,
  });
  this.exits.push(e);
  return e;
};

//============================================================================
// Instance methods : Combat
//============================================================================
RoomSchema.methods.processPlayerCombatActions = function (now) {
  const sockets = socketUtil.getRoomSockets(this.id);
  for (let socket of sockets) {
    if (!socket.character.attackTarget) continue;
    let mob = this.getMobById(socket.character.attackTarget);
    if (!mob) continue;
    socket.character.attack(socket, mob, now);
  }
};

RoomSchema.methods.processMobCombatActions = function (now) {
  if (Array.isArray(this.mobs) && this.mobs.length > 0) {
    const room = this;
    this.mobs.forEach(mob => {
      if (!mob.attack(now)) {
        mob.selectTarget(room.id, mob);
      }
      else {
        mob.taunt(now);
      }

      // this mostly applies to NPCs (sparring dummy)
      if (!mob.attackTarget) {
        mob.idle(now);
      }
    });
  }
};

export default RoomSchema;
