import mongoose from 'mongoose';
import ItemSchema from './itemSchema';
import ExitSchema from './exitSchema';
import Exit from './exit';
import Area from './area';
import SpawnerSchema from './spawnerSchema';
import socketUtil from '../core/socketUtil';
import { indefiniteArticle } from '../core/language';
import { getDirection, Direction } from '../core/directions';

const roomCache = {};

//============================================================================
// Room Schema
//============================================================================
const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  alias: String,
  areaId: String,
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  z: {
    type: Number,
    required: true,
  },
  worldId: {
    type: String,
    required: true,
  },

  exits: [ExitSchema],

  spawner: SpawnerSchema,
  inventory: [ItemSchema],
}, { usePushEach: true });

RoomSchema.index({ worldId: 1, x: 1, y: 1, z: 1 }, { unique: true });

//============================================================================
// Statics
//============================================================================
RoomSchema.statics.roomCache = roomCache;

// Todo: this needs to be renamed. It is getByIdOrAlias
RoomSchema.statics.getById = roomId => {
  const room = roomCache[roomId];
  return room;
};

RoomSchema.statics.getByCoords = function (coords) {
  return this.findOne(coords);
};

RoomSchema.statics.populateRoomCache = function () {
  this.find({}, (err, result) => {
    if (err) throw err;

    result.forEach(room => {
      room.mobs = [];
      room.tracks = {};
      roomCache[room.id.toString()] = room;
      if (room.alias)
        roomCache[room.alias] = room;
    });
  });
};

//============================================================================
// Instance methods
//============================================================================

/**
 * Returns a list of usernames of other connected players in your room.
 */
RoomSchema.methods.getCharacterNames = function (excludeSneaking) {
  return this.getCharacters(excludeSneaking).map(c => c.name);
};

RoomSchema.methods.getCharacters = function (excludeSneaking) {
  const sockets = socketUtil.getRoomSockets(this.id);
  let characters = sockets.map(s => s.character);
  if (excludeSneaking) {
    characters = characters.filter(c => !c.sneakMode());
  }
  return characters;
};

RoomSchema.methods.userInRoom = function (username) {
  let usernames = this.getCharacterNames(this.RoomId);
  usernames = usernames.map(u => u.toLowerCase());
  return usernames.includes(username.toLowerCase());
};

RoomSchema.methods.createRoom = function (dir) {

  if (!(dir instanceof Direction)) {
    return Promise.reject('Invalid direction.');
  }

  let exit = this.getExit(dir.short);
  if (exit) {
    return Promise.reject('Exit already exists');
  }

  // see if room exists at the coords
  const targetCoords = this.dirToCoords(dir.short);
  let targetRoom = Object.values(roomCache).find(r =>
    r.x === targetCoords.x
    && r.y === targetCoords.y
    && r.z === targetCoords.z);

  if (targetRoom) {
    // room already exists, just link the rooms with a new exit in each room
    this.addExit(dir, targetRoom.id);
    targetRoom.addExit(dir.opposite.short, this.id);
    this.save(err => { if (err) throw err; });
    targetRoom.save(err => { if (err) throw err; });
    return Promise.resolve(targetRoom);
  } else {
    // if room does not exist, create a new room with an exit to this room
    const currentRoom = this;

    const newRoom = new this.constructor({
      name: 'Default Room Name',
      desc: 'Room Description',
      worldId: currentRoom.worldId,
      x: targetCoords.x,
      y: targetCoords.y,
      z: targetCoords.z,
      exits: [{
        dir: dir.opposite.short,
        roomId: currentRoom.id,
      }],
    });

    // state tracking member (not included in schema)
    newRoom.tracks = [];
    newRoom.mobs = [];
    roomCache[newRoom.id] = newRoom;

    if (this.area) {
      newRoom.area = this.area;
    }

    // update this room with exit to new room
    this.addExit(dir, newRoom.id);

    this.save();
    newRoom.save();

    return Promise.resolve(newRoom);
  }
};

RoomSchema.methods.kick = function (character, item, dir) {
  const exit = this.getExit(dir);
  if (!exit) {
    return Promise.reject('There is no exit in that direction!');
  }

  const targetRoom = this.constructor.getById(exit.roomId);
  this.inventory.id(item.id).remove();
  this.save(err => { if (err) throw err; });
  targetRoom.inventory.push(item);
  targetRoom.save(err => { if (err) throw err; });

  // for scripting
  this.tracks[item.id] = {
    dir: dir,
    timestamp: new Date().getTime(),
  };

  const dirName = dir.long;
  const msg = `<span class="yellow">${character.name} kicks the ${item.name} to the ${dirName}</span>`;
  socketUtil.roomMessage(this.id, msg);

  const targetDirName = dir.opposite.long;

  // language, determining A or An
  let article = indefiniteArticle(item.name);
  article = article.replace(/^\w/, c => c.toUpperCase());

  const targetMsg = `<span class="yellow">${article} ${item.name} enters from the ${targetDirName}.</yellow>`;
  socketUtil.roomMessage(targetRoom.id, targetMsg);

  return Promise.resolve(item);
};

RoomSchema.methods.getDesc = function (character, short) {

  const socket = socketUtil.getSocketByCharacterId(character.id);
  const debug = socket.user.debug;
  let output = `<span class="cyan">${this.name}`;

  if (this.areaId) {
    output += `, ${Area.getById(this.areaId).name}`;
  }

  output += '</span>\n';

  if (!short) {
    output += `<span class="silver">${this.desc}</span>\n`;
  }

  let notHiddenItems = '';
  //let hiddenItems = '';
  if (this.inventory) {
    notHiddenItems = this.inventory.filter(({ hidden }) => !hidden).map(({ name }) => name).join(', ');
    //hiddenItems = this.inventory.filter(({ hidden }) => hidden).map(({ name }) => name).join(', ');
  }
  if (notHiddenItems != '') {
    output += `<span class="darkcyan">You notice: ${notHiddenItems}.</span>\n`;
  }
  // if (socket.user.admin && hiddenItems != '') {
  //   output += `<span class="olive">Hidden items: ${hiddenItems}.</span>\n`;
  // }

  let characterNames = this.getCharacterNames(true).filter(name => name !== character.name);

  const mobNames = this.mobs.map(m => m.displayName);
  if (mobNames) { characterNames = characterNames.concat(mobNames); }
  const formattedNames = characterNames.join('<span class="mediumOrchid">, </span>');

  if (formattedNames) {
    output += `<span class="mediumOrchid">Also here: <span class="teal">${formattedNames}</span>.</span>\n`;
  }

  let notHiddenExits = '';
  //let hiddenExits = '';
  if (this.exits) {
    notHiddenExits = this.exits.filter(e => !e.hidden).map(e => {
      let dir = getDirection(e.dir);
      let exitName = dir.long;
      const exit = this.exits.find(e => e.dir === dir.short);
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
    //output += '<pre>' + JSON.stringify(this, null, 2) + '</pre>';
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

RoomSchema.methods.getExit = function (dirShort) {
  const ldir = dirShort.toLowerCase();
  return this.exits.find(e => e.dir === ldir);
};

RoomSchema.methods.addExit = function (dir, roomId) {
  if (!(dir instanceof Direction)) return;
  const exit = this.getExit(dir.short);
  if (exit) {
    return false;
  }

  const e = new Exit({
    dir: dir.short,
    roomId: roomId,
  });
  this.exits.push(e);
  return e;
};

RoomSchema.methods.IsExitPassable = function (character, dir) {
  if (!(dir instanceof Direction)) return;

  // validate direction is valid
  if (!dir) {
    return Promise.reject('<span class="yellow">That is not a valid direction!</span>');
  }

  const exit = this.exits.find(e => e.dir === dir.short);
  if (!exit) {
    this.sendHitWallMessage(character, dir.short);
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
    this.sendHitDoorMessage(character, dir.short);
    return Promise.reject();
  }

  return Promise.resolve(exit);
};

// todo: This may need a more descriptive name, it is for "leaving by exit"
// it updates games state, generates messages
RoomSchema.methods.leave = function (character, dir, socket) {
  const exclude = socket ? [socket.id] : [];

  if (character.roomId !== this.id) {
    // TODO: investigate this. This is only possible because of data duplication that we
    // may be able to get rid of.
    throw 'Character leave was called when the character was not assigned the room';
  }

  if (!character.sneakMode()) {
    this.sendMovementSoundsMessage(dir.short);
  }

  // if this is a player
  if (socket) {
    // unsubscribe from Socket.IO room
    socket.leave(this.id);
  }

  // whenever you leave a room, you leave tracks (for tracking command and scripting options)
  this.tracks[character.id] = {
    dir: dir.short,
    timestamp: new Date().getTime(),
  };

  // leaving room message
  if (!character.sneakMode()) {
    const msg = this.getLeftMessages(dir, character.name);
    socketUtil.roomMessage(this.id, msg, exclude);
  }
};

// todo: This may need a more descriptive name, it is for "entering by exit"
// it updates games state, generates messages
RoomSchema.methods.enter = function (character, dir, socket) {
  character.roomId = this.id;

  if (!character.sneakMode()) {
    const exclude = socket ? [socket.id] : [];
    const msg = this.getEnteredMessage(dir.short, character.name);
    socketUtil.roomMessage(character.roomId, msg, exclude);
    this.sendMovementSoundsMessage(dir.short);
  }

  character.save(err => { if (err) throw err; });
  if (socket) {
    socket.join(this.id);
  }

};

RoomSchema.methods.track = function (entity) {
  let output;
  let tracks = this.tracks[entity.id];
  if (tracks) {
    const dir = getDirection(tracks.dir);

    const now = new Date().getTime();
    const rawSeconds = Math.floor((now - tracks.timestamp) / 1000);
    const minutes = Math.floor(rawSeconds / 60);
    const seconds = Math.floor(rawSeconds % 60);
    let displayString;
    if (minutes > 1) {
      displayString = `${minutes} minutes ago`;
    } else if (minutes == 1) {
      displayString = 'a minute ago';
    } else if (seconds > 1) {
      displayString = `${seconds} seconds ago`;
    } else {
      displayString = 'a second ago';
    }

    output = `<span class="yellow">${entity.name} last left to the ${dir.long} ${displayString}.</span>`;
  } else {
    output = `${entity.name} has not passed through here recently.`;
  }
  return Promise.resolve(output);
};

//============================================================================
// Instance methods : Combat
//============================================================================
RoomSchema.methods.processPlayerCombatActions = function (now) {
  const characters = this.getCharacters();

  for (let c of characters) {
    if (!c.attackTarget) continue;
    let mob = this.getMobById(c.attackTarget);
    if (!mob) continue;
    c.attack(mob, now);
  }
};

RoomSchema.methods.processEndOfRound = function (round) {
  const characters = this.getCharacters();
  characters.forEach(c => {
    c.processEndOfRound(round);
  });
};

RoomSchema.methods.processMobCombatActions = function (now) {
  if (Array.isArray(this.mobs) && this.mobs.length > 0) {
    this.mobs.forEach(mob => {

      // attack or taunt to select target
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
  if (dir.short === 'u') {
    message = `${character.name} runs into the ceiling.`;
  } else if (dir.short === 'd') {
    message = `${character.name} runs into the floor.`;
  } else {
    message = `${character.name} runs into the wall to the ${dir.long}.`;
  }
  socket.broadcast.to(socket.character.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
  return Promise.reject();
};

RoomSchema.methods.sendHitDoorMessage = function (character, dir) {
  let message = '';
  const socket = socketUtil.getSocketByCharacterId(character.id);

  // send message to everyone in current room that player is running into stuff.
  if (dir.short === 'u') {
    message = `${character.name} runs into the closed door above.`;
  } else if (dir.short === 'd') {
    message = `${character.name} runs into the trapdoor on the floor.`;
  } else {
    message = `${character.name} runs into the door to the ${dir.long}.`;
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

    let dir = getDirection(exit.dir);
    const message = `You hear movement ${dir.opposite.desc}.`;
    global.io.to(exit.roomId).emit('output', { message });
  }
};

RoomSchema.methods.getLeftMessages = function (dir, charName) {
  let output = '';
  if (dir.short === 'u') {
    output = `${charName} has gone above.`;
  } else if (dir.short === 'd') {
    output = `${charName} has gone below.`;
  } else {
    output = `${charName} has left to the ${dir.long}.`;
  }
  return `<span class="yellow">${output}</span>`;
};

RoomSchema.methods.getEnteredMessage = function (dir, charName) {
  let output = '';
  if (dir.short === 'u') {
    output = `${charName} has entered from below.`;
  } else if (dir.short === 'd') {
    output = `${charName} has entered from above.`;
  } else {
    output = `${charName} has entered from the ${dir.long}.`;
  }
  return `<span class="yellow">${output}</span>`;
};

RoomSchema.methods.output = function (msg, exclude) {
  socketUtil.roomMessage(this.id, msg, exclude);
};

export default RoomSchema;
