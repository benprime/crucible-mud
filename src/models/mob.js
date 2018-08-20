import socketUtil from '../core/socketUtil';
import config from '../config';
import utils from '../core/utilities';

/* State only model */
import { Types } from 'mongoose';
const { ObjectId } = Types;

import Room from '../models/room';
import dice from '../core/dice';

class Mob {
  constructor(mobType, roomId, adjectiveIndex) {

    const instance = Object.assign(this, mobType);
    if (!this.id) {
      this.id = new ObjectId();
    }

    if (mobType.adjectives) {
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

      instance.displayName = `${adjective.name} ${instance.displayName}`;
    }

    instance.roomId = roomId;

    return instance;
  }

  look(socket) {
    socket.emit('output', { message: this.desc });
    if (socket.user.admin) {
      socket.emit('output', { message: `Mob ID: ${this.id}` });
    }
  }

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    const room = Room.getById(this.roomId);
    room.spawnTimer = new Date();
    global.io.to(room.id).emit('output', { message: `The ${this.displayName} collapses.` });
    utils.removeItem(room.mobs, this);
    this.awardExperience();
  }

  awardExperience() {
    let sockets = socketUtil.getRoomSockets(this.roomId);
    sockets.forEach((s) => {
      if (s.character.attackTarget === this.id) {
        s.character.attackTarget = null;
        s.character.addExp(this.xp);
        s.emit('output', { message: `You gain ${this.xp} experience.` });
        s.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
      }
    });
  }

  selectTarget(roomid) {

    if(this.attackInterval === 0) return;

    if (!roomid) return;

    // if everyone has disconnected from a room (but mobs still there) the room will not be defined.
    const ioRoom = global.io.sockets.adapter.rooms[roomid];

    // if there is at least one player in the room
    if (ioRoom) {

      if (!this.attackTarget) {
        // select random player to attack
        const charactersInRoom = Object.values(ioRoom.sockets).map(s => s.character);
        if (charactersInRoom.length == 0) return;
        const targetIndex = dice.getRandomNumber(0, charactersInRoom.length);
        
        const targetCharacter = charactersInRoom[targetIndex];

        // get player socket
        // TODO: this will all go away..?
        const socket = socketUtil.getSocketByCharacterId(targetCharacter.id);

        this.attackTarget = targetCharacter.id;
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

    if (!socketUtil.characterInRoom(this.roomId, this.attackTarget)) {
      this.attackTarget = null;
      return false;
    }

    this.lastAttack = now;
    const dmg = 0;
    let playerMessage = '';
    let roomMessage = '';

    let character = socketUtil.getCharacterById(this.attackTarget);
    if (!character) return false;

    if (this.attackroll() == 1) {
      playerMessage = `<span class="${config.DMG_COLOR}">The ${this.displayName} hits you for ${dmg} damage!</span>`;
      roomMessage = `<span class="${config.DMG_COLOR}">The ${this.displayName} hits ${character.name} for ${dmg} damage!</span>`;
    } else {
      playerMessage = `<span class="${config.MSG_COLOR}">The ${this.displayName} swings at you, but misses!</span>`;
      roomMessage = `<span class="${config.MSG_COLOR}">The ${this.displayName} swings at ${character.name}, but misses!</span>`;
    }

    const socket = socketUtil.getSocketByCharacterId(character.id);

    socket.emit('output', { message: playerMessage });
    socketUtil.roomMessage(character.roomId, roomMessage, [character.id]);

    return true;
  }

  taunt(now) {
    if (!this.readyToTaunt(now)) return;
    this.lastTaunt = now;

    if (!this.attackTarget) return;

    const socket = global.io.sockets.connected[this.attackTarget];
    if (!socket) {
      return;
    }

    if (!socketUtil.characterInRoom(this.roomId, this.attackTarget)) {
      this.attackTarget = null;
      return;
    }

    const tauntIndex = dice.getRandomNumber(0, this.taunts.length);
    let taunt = this.taunts[tauntIndex];
    taunt = utils.formatMessage(taunt, this.displayName, 'you');
    let username = socket.user.username;
    let roomTaunt = utils.formatMessage(this.taunts[tauntIndex], this.displayName, username);
    socket.emit('output', { message: taunt });
    socket.broadcast.to(socket.character.roomId).emit('output', { message: roomTaunt });
  }

  idle(now) {
    if (this.attackTarget) return;
    if (!this.readyToIdle(now)) return;
    this.lastIdle = now;

    const idleIndex = dice.getRandomNumber(0, this.idleActions.length);
    let idleTemplate = this.idleActions[idleIndex];
    let roomIdleAction = utils.formatMessage(idleTemplate, this.displayName);
    global.io.to(this.roomId).emit('output', { message: roomIdleAction });
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

export default Mob;
