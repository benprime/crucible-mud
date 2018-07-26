const socketUtil = require('../core/socketUtil');
const config = require('../../config');

/* State only model */
const ObjectId = require('mongodb').ObjectId;
const Room = require('../models/room');
const dice = require('../core/dice');
const utils = require('../core/utilities');

class Mob {
  constructor(mobType, roomId, adjectiveIndex) {

    // TODO: When we refactor this, the mob instance does
    // not need to contain the entire mobType.
    const instance = Object.assign(this, mobType);
    if (!this.id) {
      this.id = new ObjectId();
    }

    let adjIndex;
    if (Number.isInteger(adjectiveIndex)) {
      adjIndex = adjectiveIndex;
    } else {
      adjIndex = dice.getRandomNumber(0, mobType.adjectives.length);
    }

    // apply modifiers
    const adjective = mobType.adjectives[adjIndex];
    instance.hp += adjective.modifiers.hp;
    instance.xp += adjective.modifiers.xp;
    instance.minDamage += adjective.modifiers.minDamage;
    instance.maxDamage += adjective.modifiers.maxDamage;
    instance.hitDice += adjective.modifiers.hitDice;
    instance.attackInterval += adjective.modifiers.attackInterval;

    instance.roomId = roomId;

    instance.displayName = `${adjective.name} ${instance.displayName}`;

    return instance;
  }

  look(socket) {
    socket.emit('output', { message: this.desc });
    if (socket.user.admin) {
      socket.emit('output', { message: `Mob ID: ${this.id}` });
    }
  }

  takeDamage(socket, damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die(socket);
    }
  }

  die(socket) {
    const room = Room.getById(socket.user.roomId);
    room.spawnTimer = new Date();
    global.io.to(room.id).emit('output', { message: `The ${this.displayName} collapses.` });
    utils.removeItem(room.mobs, this);
    this.awardExperience(socket);
  }

  // todo: cleaning up for current room. This may need some rework when the mobs
  // can move from room to room.
  awardExperience({user}) {
    const room = Room.getById(user.roomId);
    let sockets = socketUtil.getRoomSockets(room.id);
    sockets.forEach((s) => {
      if (s.user.attackTarget === this.id) {
        s.user.attackTarget = null;
        s.user.addExp(this.xp);
        s.emit('output', { message: `You gain ${this.xp} experience.` });
        s.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
      }
    });
  }

  selectTarget(roomid) {

    if (!roomid) return;

    // if everyone has disconnected from a room (but mobs still there) the room will not be defined.
    const ioRoom = global.io.sockets.adapter.rooms[roomid];

    // if there is at least one player in the room
    if (ioRoom) {
      // todo: check if this player has left or died or whatever.
      if (!this.attackTarget) {
        // select random player to attack
        const socketsInRoom = Object.keys(ioRoom.sockets);
        if (socketsInRoom.length == 0) return;
        const targetIndex = dice.getRandomNumber(0, socketsInRoom.length);
        const socketId = socketsInRoom[targetIndex];

        // get player socket
        const socket = global.io.sockets.connected[socketId];

        this.attackTarget = socketId;
        const username = socket.user.username;

        socket.broadcast.to(roomid).emit('output', { message: `The ${this.displayName} moves to attack ${username}!` });
        socket.emit('output', { message: `The ${this.displayName} moves to attack you!` });
      }
    }
  }

  attackroll() {
    return dice.roll('1d2');
  }

  attack(now) {

    if (!this.attackTarget) {
      return false;
    }

    if (!this.readyToAttack(now)) {
      return false;
    }

    if (!socketUtil.socketInRoom(this.roomId, this.attackTarget)) {
      this.attackTarget = null;
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

    if (this.attackroll() == 1) {
      playerMessage = `<span class="${config.DMG_COLOR}">The ${this.displayName} hits you for ${dmg} damage!</span>`;
      roomMessage = `<span class="${config.DMG_COLOR}">The ${this.displayName} hits ${playerName} for ${dmg} damage!</span>`;
    } else {
      playerMessage = `<span class="${config.MSG_COLOR}">The ${this.displayName} swings at you, but misses!</span>`;
      roomMessage = `<span class="${config.MSG_COLOR}">The ${this.displayName} swings at ${playerName}, but misses!</span>`;
    }

    playerSocket.emit('output', { message: playerMessage });
    socketUtil.roomMessage(playerSocket.user.roomId, roomMessage, [playerSocket.id]);

    return true;
  }

  taunt(now) {
    if (!this.readyToTaunt(now)) return;
    this.lastTaunt = now;

    if (!this.attackTarget) return;

    const socket = global.io.sockets.connected[this.attackTarget];
    if(!socket) {
      return;
    }

    if (!socketUtil.socketInRoom(this.roomId, this.attackTarget)) {
      this.attackTarget = null;
      return;
    }

    const tauntIndex = dice.getRandomNumber(0, this.taunts.length);
    let taunt = this.taunts[tauntIndex];
    taunt = utils.formatMessage(taunt, this.displayName, 'you');
    let username = socket.user.username;
    let roomTaunt = utils.formatMessage(this.taunts[tauntIndex], this.displayName, username);
    socket.emit('output', { message: taunt });
    socket.broadcast.to(socket.user.roomId).emit('output', { message: roomTaunt });
  }

  readyToAttack(now) {
    return !!this.attackInterval && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
  }

  readyToTaunt(now) {
    return !!this.tauntInterval && this.attackTarget && (!this.lastTaunt || this.lastTaunt + this.tauntInterval <= now);
  }

  readyToIdle(now) {
    return !!this.idleInterval && (!this.lastIdle || this.lastIdle + this.idleInterval <= now);
  }
}

module.exports = Mob;
