'use strict';

/* State only model */
const ObjectId = require('mongodb').ObjectId;
const roomManager = require('../roomManager');
const dice = require('../dice');



function Mob(mobType) {
  this.id = new ObjectId().toString();
  this.roomId = null;

  return Object.assign(this, mobType);
}

Mob.prototype.TakeDamage = function(socket, damage) {
  this.hp -= damage;
  if (this.hp <= 0) {
    this.Die(socket);
  }
};

Mob.prototype.Die = function(socket) {
  roomManager.getRoomById(socket.user.roomId, (room) => {

    global.io.to(room.id).emit('output', { message: 'The creature collapses.' });
    socket.emit('output', { message: `You gain ${this.xp} experience.` });

    // remove mob from the room    
    let i = room.mobs.indexOf(this);
    room.mobs.splice(i, 1);

    let sockets = room.getSockets();
    sockets.forEach((s) => {
      if (s.attackTarget === this) {
        s.user.attackTarget = null;
        s.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
      }
    });


    // loop through sockets in room... remove this mob from all other attack targets
    /*
    const room = global.io.sockets.adapter.rooms[socket.user.roomId];
    Object.keys(room.sockets).forEach((socketId) => {
      let otherSocket = global.io.sockets.connected[socketId];
      if (otherSocket.attackTarget === this) {
        otherSocket.attackTarget = null;
        otherSocket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
      }
    });
    */
  });

};

Mob.prototype.selectTarget = function(roomid) {
  // if everyone has disconnected from a room (but mobs still there) the room will not be defined.
  const room = global.io.sockets.adapter.rooms[roomid];

  // if there is at least one player in the room
  if (room) {
    // todo: check if this player has left or died or whatever.
    if (!this.attackTarget) {
      console.log("Finding mob attack target...");

      // select random player to attack
      const clients = room.sockets;
      const socketsInRoom = Object.keys(clients);
      const targetIndex = global.getRandomNumber(0, socketsInRoom.length);
      const socketId = socketsInRoom[targetIndex];
      console.log("target's socket id: " + socketId);

      // get player socket
      const socket = global.io.sockets.connected[socketId];

      //todo: I guess attack target can be the socketId? hrmm...
      this.attackTarget = socketId;
      const username = socket.user.username;

      socket.broadcast.to(roomid).emit('output', { message: `The ${this.displayName} moves to attack ${username}!` });
      socket.emit('output', { message: `The ${this.displayName} moves to attack you!` });
      // todo: send to user socket as "moves to attack you" change the above to the emit to a socket broadcast.


      //console.log(targetIndex);
      //console.log(socketId);
    }
  }
};

Mob.prototype.attackRoll = function() {
  // just return 0 or 1 for now
  return dice.Roll('1d2');
};

Mob.prototype.attack = function(now) {
  console.log("mob target:" + this.attackTarget);
  this.lastAttack = now;

  // TODO: THIS IS BROKEN
  // need to save attack target in the mobs attack.... and perhaps save username or socket id so we know who
  // to send a message to...
  const dmg = 0;


  let socketId = this.attackTarget;

  let playerMessage = '';
  let roomMessage = '';

  let playerSocket = global.io.sockets.connected[socketId];
  let playerName = playerSocket.user.username;

  if (this.attackRoll()) {
    playerMessage = `<span class="${global.DMG_COLOR}">${this.displayName} hits you for ${dmg} damage!</span>`;
    roomMessage = `<span class="${global.DMG_COLOR}">The ${this.displayName} hits ${playerName} for ${dmg} damage!</span>`;
  } else {
    playerMessage = `<span class="${global.MSG_COLOR}">The ${this.displayName} swings at you, but misses!</span>`;
    roomMessage = `<span class="${global.MSG_COLOR}">The ${this.displayName} swings at ${playerName}, but misses!</span>`;
  }

  // TODO: this will have to handle all damage and experience stuff...

  // todo: should not rely on target player's socket to inform other players of combat stuffs.
  // If the player disconnects, game should still inform players. Perhaps just loop through all sockets in room (like in actions.)
  playerSocket.emit('output', { message: playerMessage });
  playerSocket.broadcast.to(playerSocket.room._id).emit('output', { message: roomMessage });

  //io.to(roomId).emit('output', { message });

};

Mob.prototype.readyToAttack = function(now) {
  return this.attackInterval && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
};

Mob.prototype.readyToTaunt = function(now) {
  return this.tauntInterval && (!this.lastTaunt || this.lastTaunt + this.tauntInterval <= now);
};

Mob.prototype.readyToIdle = function(now) {
  return this.idleInterval && (!this.lastIdle || this.lastIdle + this.idleInterval <= now);
};

module.exports = Mob;
