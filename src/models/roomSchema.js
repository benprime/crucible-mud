import mongoose from 'mongoose';
import ItemSchema from './itemSchema';
import ExitSchema from './exitSchema';
import Exit from './exit';
import Area from './area';
import SpawnerSchema from './spawnerSchema';
import socketUtil from '../core/socketUtil';
import { getDirection, Direction } from '../core/directions';
import gameManager from '../core/gameManager';
import actionHandler from '../core/actionHandler';

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

  // this is currently for NPCs only
  // characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],

  spawner: SpawnerSchema,
  inventory: [ItemSchema],
}, { usePushEach: true });

// Adding mutli-column unique index
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
  return Object.values(roomCache).find(r => r.x == coords.x && r.y == coords.y && r.z == coords.z);
};

RoomSchema.statics.populateRoomCache = function () {
  return this.find({}, (err, result) => {
    if (err) throw err;

    result.forEach(room => {
      room.initialize();
      roomCache[room.id.toString()] = room;
      gameManager.on('frame', function (now, round, newRound) {
        room.update(now, round, newRound);
      });
      if (room.alias)
        roomCache[room.alias] = room;
    });
  });
};

//============================================================================
// Instance methods
//============================================================================

RoomSchema.methods.initialize = function () {
  this.mobs = [];
  this.tracks = {};
  this.characters = [];
};

// the game loop frame handler
RoomSchema.methods.update = function (now, round, newRound) {

  this.characters.forEach(c => c.update(now, round, newRound));

  // todo: these "process" methods will get refactored into the standard "update" methods
  this.processMobCombatActions(now);
  this.processPlayerCombatActions(now);

  if (newRound) {
    this.processEndOfRound(round);
  }
};

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
    && r.z === targetCoords.z
    && r.worldId == this.worldId);

  if (targetRoom) {
    // room already exists, just link the rooms with a new exit in each room
    this.addExit(dir, targetRoom.id);
    this.save(err => { if (err) throw err; });
    targetRoom.addExit(dir.opposite, this.id);
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
    newRoom.initialize();
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

RoomSchema.methods.createDoor = function (dir) {

  if (!(dir instanceof Direction)) {
    return Promise.reject('Invalid direction.');
  }

  const exit = this.getExit(dir.short);

  if (!exit) {
    return Promise.reject('No exit exists in that direction.');
  }

  if (exit.closed !== undefined) {
    return Promise.reject('Door already exists.');
  }

  exit.closed = true;
  this.save(err => { if (err) throw err; });
  return Promise.resolve();
};


RoomSchema.methods.getDesc = function (character, short) {

  const socket = socketUtil.getSocketByCharacterId(character.id);
  const debug = socket.character.user.debug;
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

  return output;
};

RoomSchema.methods.dirToCoords = function (dirShort) {
  let x = this.x;
  let y = this.y;
  let z = this.z;

  if (dirShort.includes('e')) x += 1;
  if (dirShort.includes('w')) x -= 1;
  if (dirShort.includes('n')) y += 1;
  if (dirShort.includes('s')) y -= 1;
  if (dirShort.includes('u')) z += 1;
  if (dirShort.includes('d')) z -= 1;

  return { x, y, z };
};

RoomSchema.methods.getExit = function (dirShort) {
  const ldir = dirShort.toLowerCase();
  return this.exits.find(e => e.dir === ldir);
};

RoomSchema.methods.addExit = function (dir, roomId) {
  if (!(dir instanceof Direction)) throw 'Room.AddExit: dir must be of type Direction';
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

RoomSchema.methods.handleAction = function () {
  const params = Array.from(arguments);
  const character = params.shift();
  const actionName = params.shift();
  const action = actionHandler.actions[actionName];
  if (!action || !action.execute) {
    throw (`Cannot find valid action object with name: ${actionName}`);
  }

  // todo: perhaps just execute this through the room
  // the player is in and use the room as the controller.
  action.execute(character, ...params);
};

//============================================================================
// Instance methods : Combat
//============================================================================
RoomSchema.methods.processPlayerCombatActions = function (now) {
  const characters = this.getCharacters();

  for (let c of characters) {
    if (!c) return; // incase someone logs out while this loop is running
    if (!c.attackTarget) continue;
    let mob = this.mobs.find(({ id }) => id === c.attackTarget);
    if (!mob) continue;
    c.attack(mob, now);
  }
};

RoomSchema.methods.processEndOfRound = function (round) {
  const characters = this.getCharacters();
  characters.forEach(c => {
    if (!c) return;
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

RoomSchema.methods.output = function (msg, exclude) {
  socketUtil.roomMessage(this.id, msg, exclude);
};

export default RoomSchema;
