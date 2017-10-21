'use strict';

require('../globals');

/* State only model */
const ObjectId = require('mongodb').ObjectId;
const Room = require('../models/room');
const dice = require('../dice');

function Mob(mobType, roomId) {
  const instance = Object.assign(this, mobType);
  if (!this.id) {
    this.id = new ObjectId().toString();
  }

  // apply modifiers
  const adjIndex = global.getRandomNumber(0, mobType.adjectives.length);
  const adjective = mobType.adjectives[adjIndex];
  instance.hp += adjective.modifiers.hp;
  instance.xp += adjective.modifiers.xp;
  instance.minDamage += adjective.modifiers.minDamage;
  instance.maxDamage += adjective.modifiers.maxDamage;
  instance.hitDice += adjective.modifiers.hitDice;
  instance.attackInterval += adjective.modifiers.attackInterval;

  instance.roomId = roomId;

  instance.displayName = adjective.name + ' ' + instance.displayName;

  return instance;
}

Mob.prototype.look = function (socket) {
  socket.emit('output', { message: this.desc });
  if (socket.user.admin) {
    socket.emit('output', { message: `Mob ID: ${this.id}` });
  }
};

Mob.prototype.TakeDamage = function (socket, damage) {
  this.hp -= damage;
  if (this.hp <= 0) {
    this.Die(socket);
  }
};

Mob.prototype.Die = function (socket) {
  const room = Room.getById(socket.user.roomId);
  room.lastMobDeath = new Date();
  global.io.to(room.id).emit('output', { message: `The ${this.displayName} collapses.` });
  room.mobs.remove(this);
  this.Dispose(socket);
};

// todo: cleaning up for current room. This may needs some rework when the mobs
// can move from room to room.
Mob.prototype.Dispose = function (socket) {
  const room = Room.getById(socket.user.roomId);
  let sockets = room.getSockets();
  sockets.forEach((s) => {
    if (s.user.attackTarget === this.id) {
      s.user.attackTarget = null;
      s.user.addExp(this.xp);
      s.emit('output', { message: `You gain ${this.xp} experience.` });
      s.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    }
  });
};

Mob.prototype.selectTarget = function (roomid) {
  // if everyone has disconnected from a room (but mobs still there) the room will not be defined.
  const room = global.io.sockets.adapter.rooms[roomid];

  // if there is at least one player in the room
  if (room) {
    // todo: check if this player has left or died or whatever.
    if (!this.attackTarget) {
      // select random player to attack
      const clients = room.sockets;
      const socketsInRoom = Object.keys(clients);
      const targetIndex = global.getRandomNumber(0, socketsInRoom.length);
      const socketId = socketsInRoom[targetIndex];

      // get player socket
      const socket = global.io.sockets.connected[socketId];

      this.attackTarget = socketId;
      const username = socket.user.username;

      socket.broadcast.to(roomid).emit('output', { message: `The ${this.displayName} moves to attack ${username}!` });
      socket.emit('output', { message: `The ${this.displayName} moves to attack you!` });
    }
  }
};

Mob.prototype.attackRoll = function () {
  return dice.Roll('1d2');
};

Mob.prototype.attack = function (now) {

  if (!this.attackTarget) {
    return false;
  }

  if (!global.socketInRoom(this.roomId, this.attackTarget)) {
    this.attackTarget = undefined;
    return false;
  }

  this.lastAttack = now;
  const dmg = 0;
  let socketId = this.attackTarget;
  let playerMessage = '';
  let roomMessage = '';

  let playerSocket = global.io.sockets.connected[socketId];
  if (!playerSocket) return false;
  let playerName = playerSocket.user.username;

  if (this.attackRoll() == 1) {
    playerMessage = `<span class="${global.DMG_COLOR}">${this.displayName} hits you for ${dmg} damage!</span>`;
    roomMessage = `<span class="${global.DMG_COLOR}">The ${this.displayName} hits ${playerName} for ${dmg} damage!</span>`;
  } else {
    playerMessage = `<span class="${global.MSG_COLOR}">The ${this.displayName} swings at you, but misses!</span>`;
    roomMessage = `<span class="${global.MSG_COLOR}">The ${this.displayName} swings at ${playerName}, but misses!</span>`;
  }

  // todo: should not rely on target player's socket to inform other players of combat stuffs.
  // If the player disconnects, game should still inform players. Perhaps just loop through all sockets in room (like in actions.)
  // If there is a problem with this in the future, use room.getSockets and loop through them instead.
  // todo: test by disconnecting during combat.
  playerSocket.emit('output', { message: playerMessage });
  playerSocket.broadcast.to(playerSocket.user.roomId).emit('output', { message: roomMessage });
  //io.to(roomId).emit('output', { message });

  return true;
};

Mob.prototype.taunt = function (now) {
  const tauntIndex = global.getRandomNumber(0, this.taunts.length);

  let taunt = this.taunts[tauntIndex];
  taunt = taunt.format(this.displayName, 'you');

  const socket = global.io.sockets.connected[this.attackTarget];
  let username = '';
  if (!socket) {
    this.attackTarget = null;
  } else {
    username = socket.user.username;
  }
  let roomTaunt = this.taunts[tauntIndex].format(this.displayName, username);

  this.lastTaunt = now;

  socket.emit('output', { message: taunt });
  socket.broadcast.to(socket.user.roomId).emit('output', { message: roomTaunt });
};

Mob.prototype.readyToAttack = function (now) {
  return this.attackInterval && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
};

Mob.prototype.readyToTaunt = function (now) {
  return this.tauntInterval && this.attackTarget && (!this.lastTaunt || this.lastTaunt + this.tauntInterval <= now);
};

Mob.prototype.readyToIdle = function (now) {
  return this.idleInterval && (!this.lastIdle || this.lastIdle + this.idleInterval <= now);
};

module.exports = Mob;
