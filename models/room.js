'use strict';

const mongoose = require('mongoose');

const dirEnum = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'];

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  desc: {
    type: String,
  },

  // should this be in a sub-object called "position" or "coords"?
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
    }
  }],

  inventory: []

});

// todo: move to RoomHelper.js
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

/**
 * @param  {Number}
 * @param  {Number}
 * @param  {Number}
 * @param  {Function}
 * @return {[type]}
 */
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

RoomSchema.statics.isValidDir = function (dir) {
  // todo: RoomSchema may be the wrong thing here
  return RoomSchema.schema.path('exits.dir').enumValues.indexOf(dir) > -1;
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

  // rodo: remove first check after old data has been purged
  if (this.inventory && this.inventory.length > 0) {
    output += `<span class='darkcyan'>You notice: ${this.inventory.map(item => item.displayName).join(', ')}.</span>\n`;
  }

  let names = global.UsersInRoom(this.id).filter(name => name !== socket.user.username);

  console.log("Users in room names: ", names);

  const mobNames = this.mobs.map(mob => mob.displayName + ' ' + mob.hp);
  if (mobNames) { names = names.concat(mobNames); }
  const displayNames = names.join('<span class=\'mediumOrchid\'>, </span>');

  if (displayNames) {
    output += `<span class='purple'>Also here: <span class='teal'>${displayNames}</span>.</span>\n`;
  }

  if (this.exits.length > 0) {
    output += `<span class='green'>Exits: ${this.exits.map(door => Room.exitName(door.dir)).join(', ')}</span>\n`;
  }

  if(!short && socket.user.admin) {
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

RoomSchema.methods.addDoor = function (dir, roomId) {
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

RoomSchema.methods.createRoom = function (dir) {
  const roomModel = this.model('Room');

  let exit = this.getExit(dir);
  if (exit) {
    // todo: print message?
    return false;
  }

  // see if room exists at the coords
  var targetCoords = this.dirToCoords(dir);
  const fromRoom = this;

  roomModel.byCoords(targetCoords, function (targetRoom) {
    const oppDir = roomModel.oppositeDirection(dir);
    if (targetRoom) {
      fromRoom.addDoor(dir, targetRoom.id);
      targetRoom.addDoor(oppDir, fromRoom.id);
      fromRoom.save();
      targetRoom.save();
    } else {
      // if room does not exist, create a new room
      // with a door to this room
      console.log("from room:", fromRoom);
      targetRoom = new Room({
        name: 'Default Room Name',
        desc: 'Room Description',
        x: targetCoords.x,
        y: targetCoords.y,
        z: targetCoords.z,
        exits: [{
          dir: oppDir,
          roomId: fromRoom.id,
        }],
      });

      // update this room with door to new room
      targetRoom.save(function (err, updatedRoom) {
        fromRoom.addDoor(dir, updatedRoom.id);
        fromRoom.save();
      });

    }


  });
};

/**
 * Post-Hook Save Magic Middleware
 */
// TODO: change this to a pre call? It can update the state BEFORE we save to mongo for faster game play.
/*
RoomSchema.post('save', function(room) {
  console.log("ROOM MANAGER: ", roomManager)
  roomManager.updateRoomState(room);
  console.log('%s has been saved', room.id);
});
*/

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
