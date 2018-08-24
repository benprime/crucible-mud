import mongoose from 'mongoose';
import ItemSchema from './itemSchema';
import ExitSchema from './exitSchema';
import Exit from './exit';
import Area from './area';
import SpawnerSchema from './spawnerSchema';
import socketUtil from '../core/socketUtil';

const roomCache = {};

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
  areaId: {
    type: String,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  z: {
    type: Number,
    default: 0,
  },

  exits: [ExitSchema],

  spawner: SpawnerSchema,
  inventory: [ItemSchema],
}, { usePushEach: true });

RoomSchema.index({ x: 1, y: 1, z: 1 }, { unique: true });

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

RoomSchema.statics.byCoords = function (coords) {
  return this.findOne(coords);
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

/**
 * Factory method to make it possible to mock the constructor.
 */
RoomSchema.statics.create = function (obj) {
  return new this(obj);
};

//============================================================================
// Instance methods
//============================================================================

/**
 * Returns a list of usernames of other connected players in your room.
 */
RoomSchema.methods.getCharacterNames = function () {
  return this.getCharacters().map(c => c.name);
};

RoomSchema.methods.getCharacters = function () {
  const ioRoom = global.io.sockets.adapter.rooms[this.id];
  if (!ioRoom) {
    return [];
  }

  const otherUsers = Object.keys(ioRoom.sockets);
  return otherUsers.map(socketId => global.io.sockets.connected[socketId].character);
};

RoomSchema.methods.userInRoom = function (username) {
  let usernames = this.getCharacterNames(this.RoomId);
  usernames = usernames.map(u => u.toLowerCase());
  return usernames.includes(username.toLowerCase());
};

RoomSchema.methods.characterInRoom = function (characterId) {
  const character = socketUtil.getCharacterById(characterId);
  return character.roomId === this.id;
};

RoomSchema.methods.createRoom = function (dir) {
  const currentRoom = this;
  if (!this.constructor.validDirectionInput(dir)) {
    return Promise.reject('Invalid direction');
  }

  let exit = currentRoom.getExit(dir);
  if (exit) {
    return Promise.reject('Exit already exists');
  }

  // see if room exists at the coords
  const targetCoords = currentRoom.dirToCoords(dir);
  let targetRoom = Object.values(roomCache).find(r =>
    r.x === targetCoords.x
    && r.y === targetCoords.y
    && r.z === targetCoords.z);

  const oppDir = this.constructor.oppositeDirection(dir);

  if (targetRoom) {
    // room already exists, just link the rooms with an exit
    currentRoom.addExit(dir, targetRoom.id);
    targetRoom.addExit(oppDir, currentRoom.id);
    currentRoom.save(err => { if (err) throw err; });
    targetRoom.save(err => { if (err) throw err; });
    return Promise.resolve(targetRoom);
  } else {
    // if room does not exist, create a new room
    // with an exit to this room
    targetRoom = this.constructor.create({
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
    return targetRoom.save().then(updatedRoom => {

      // add new room to room cache
      targetRoom.mobs = [];
      roomCache[updatedRoom.id] = updatedRoom;

      currentRoom.addExit(dir, updatedRoom.id);

      return currentRoom.save().catch(err => { throw err; });
    }).catch(err => { throw err; });
  }
};

RoomSchema.methods.look = function (character, short) {

  const socket = socketUtil.getSocketByCharacterId(character.id);
  const debug = socket.user.debug;
  let output = `<span class="cyan">${this.name}`;

  if (this.area) {
    output += `, ${Area.getById(this.area).name}`;
  }

  output += '</span>\n';

  if (!short) {
    output += `<span class="silver">${this.desc}</span>\n`;
  }

  let notHiddenItems = '';
  //let hiddenItems = '';
  if (this.inventory) {
    notHiddenItems = this.inventory.filter(({ hidden }) => !hidden).map(({ displayName }) => displayName).join(', ');
    //hiddenItems = this.inventory.filter(({ hidden }) => hidden).map(({ displayName }) => displayName).join(', ');
  }
  if (notHiddenItems != '') {
    output += `<span class="darkcyan">You notice: ${notHiddenItems}.</span>\n`;
  }
  // if (socket.user.admin && hiddenItems != '') {
  //   output += `<span class="olive">Hidden items: ${hiddenItems}.</span>\n`;
  // }

  let characterNames = this.getCharacterNames(this.id).filter(name => name !== character.name);

  const mobNames = this.mobs.map(({ displayName }) => `${displayName}`);
  if (mobNames) { characterNames = characterNames.concat(mobNames); }
  const displayNames = characterNames.join('<span class="mediumOrchid">, </span>');

  if (displayNames) {
    output += `<span class="purple">Also here: <span class="teal">${displayNames}</span>.</span>\n`;
  }

  let notHiddenExits = '';
  //let hiddenExits = '';
  if (this.exits) {
    notHiddenExits = this.exits.filter(({ hidden }) => !hidden).map(({ dir }) => {
      let exitName = this.constructor.shortToLong(dir);
      const exit = this.exits.find(e => e.dir === dir);
      if (exit.closed) {
        exitName += ' (closed)';
      } else if ('closed' in exit && exit.closed === false) {
        exitName += ' (open)';
      }
      return exitName;
    }).join(', ');
    //hiddenExits = this.exits.filter(({ hidden }) => hidden).map(({ dir }) => this.constructor.shortToLong(dir)).join(', ');
  }
  if (notHiddenExits != '') {
    output += `<span class="green">Exits: ${notHiddenExits}</span>\n`;
  }
  // if (socket.user.admin && hiddenExits != '') {
  //   output += `<span class="firebrick">Hidden exits: ${hiddenExits}</span>\n`;
  // }

  if (!short && debug) {
    output += `<span class="gray">Room ID: ${this.id}</span>\n`;
    output += `<span class="gray">Room coords: ${this.x}, ${this.y}</span>\n`;
    if (this.alias) output += `<span class="gray">Alias: ${this.alias}</span>\n`;
  }

  return Promise.resolve(output);
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

RoomSchema.methods.IsExitPassable = function (character, dir) {

  // validate direction is valid
  const validDir = this.constructor.validDirectionInput(dir.toLowerCase());
  if (!validDir) {
    return Promise.reject('<span class="yellow">That is not a valid direction!</span>');
  }

  const exit = this.exits.find(e => e.dir === validDir);
  if (!exit) {
    this.sendHitWallMessage(character, validDir);
    return Promise.reject();
  }

  // custom scripting exit disabler
  if (exit.disabledMessage) {
    return Promise.reject(`<span class="yellow">${exit.disabledMessage}</span>`);
  }

  // general public cannot enter hidden rooms.
  // admin can enter a hidden room, even if it is not revealed.
  // if (exit.hidden && !character.user.admin) {
  //   const msg = GetHitWallMessage(character, dir);
  //   roomMessages.push({roomId: this.id, message: msg});
  //   return Promise.reject();
  // }

  if (exit.closed) {
    this.sendHitDoorMessage(character, validDir);
    return Promise.reject();
  }

  return Promise.resolve(exit);
};

// todo: This may need a more descriptive name, it is for "leaving by exit"
// it updates games state, generates messages
RoomSchema.methods.leave = function (character, dir, socket) {
  const exclude = socket ? [socket.id] : [];

  this.sendMovementSoundsMessage(dir);

  // if this is a player
  if (socket) {
    // unsubscribe from Socket.IO room
    socket.leave(character.roomId);
  }

  // leaving room message
  const msg = this.getLeftMessages(dir, character.name);
  socketUtil.roomMessage(character.roomId, msg, exclude);
};

// todo: This may need a more descriptive name, it is for "entering by exit"
// it updates games state, generates messages
RoomSchema.methods.enter = function (character, dir, socket) {
  const exclude = socket ? [socket.id] : [];
  const msg = this.getEnteredMessage(dir, character.name);

  character.roomId = this.id;
  socketUtil.roomMessage(character.roomId, msg, exclude);

  // todo: Review this. Not sure if we want to same state persistence for NPCs
  character.save(err => { if (err) throw err; });
  socket.join(this.id);

  this.sendMovementSoundsMessage(dir);
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
    this.mobs.forEach(mob => {
      if (!mob.attack(now)) {
        mob.taunt(now);
      }

      // this mostly applies to NPCs (sparring dummy)
      if (now > mob.lastAttack + mob.attackInterval) {
        mob.idle(now);
      }
    });
  }
};

//============================================================================
// Helper methods for socket output, these will likely be moved.
//============================================================================
RoomSchema.methods.sendHitWallMessage = function (character, dir) {
  let message = '';
  const socket = socketUtil.getSocketByCharacterId(character.id);

  // send message to everyone in current room that player is running into stuff.
  if (dir === 'u') {
    message = `${character.name} runs into the ceiling.`;
  } else if (dir === 'd') {
    message = `${character.name} runs into the floor.`;
  } else {
    message = `${character.name} runs into the wall to the ${this.constructor.shortToLong(dir)}.`;
  }
  socket.broadcast.to(socket.character.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
  return Promise.reject();
};

RoomSchema.methods.sendHitDoorMessage = function (character, dir) {
  let message = '';
  const socket = socketUtil.getSocketByCharacterId(character.id);

  // send message to everyone in current room that player is running into stuff.
  if (dir === 'u') {
    message = `${character.name} runs into the closed door above.`;
  } else if (dir === 'd') {
    message = `${character.name} runs into the trapdoor on the floor.`;
  } else {
    message = `${character.name} runs into the door to the ${this.constructor.shortToLong(dir)}.`;
  }
  socket.broadcast.to(socket.character.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
  return Promise.reject();
};

// emits "You hear movement to the <dir>" to all adjacent rooms
RoomSchema.methods.sendMovementSoundsMessage = function (excludeDir) {

  // fromRoomId is your current room (before move)
  for (let exit of this.exits) {
    if (excludeDir && exit.dir === excludeDir) {
      continue;
    }

    let message = '';
    if (exit.dir === 'u') {
      message = 'You hear movement from below.';
    } else if (exit.dir === 'd') {
      message = 'You hear movement from above.';
    } else {
      const oppDir = this.constructor.shortToLong(this.constructor.oppositeDirection(exit.dir));
      message = `You hear movement to the ${oppDir}.`;
    }

    global.io.to(exit.roomId).emit('output', { message });
  }
};

RoomSchema.methods.getLeftMessages = function (dir, charName) {
  const displayDir = this.constructor.shortToLong(dir);
  let output = '';
  if (dir === 'u') {
    output = `${charName} has gone above.`;
  } else if (dir === 'd') {
    output = `${charName} has gone below.`;
  } else {
    output = `${charName} has left to the ${displayDir}.`;
  }
  return `<span class="yellow">${output}</span>`;
};

RoomSchema.methods.getEnteredMessage = function (dir, charName) {
  const displayDir = this.constructor.shortToLong(dir);
  let output = '';
  if (dir === 'u') {
    output = `${charName} has entered from below.`;
  } else if (dir === 'd') {
    output = `${charName} has entered from above.`;
  } else {
    output = `${charName} has entered from the ${displayDir}.`;
  }
  return `<span class="yellow">${output}</span>`;
};

RoomSchema.methods.output = function (msg, exclude) {
  socketUtil.roomMessage(this.id, msg, exclude);
};



export default RoomSchema;
