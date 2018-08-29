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
      this.adjective = adjective.name;
      instance.hp += adjective.modifiers.hp;
      instance.xp += adjective.modifiers.xp;
      instance.minDamage += adjective.modifiers.minDamage;
      instance.maxDamage += adjective.modifiers.maxDamage;
      instance.hitDice += adjective.modifiers.hitDice;
      instance.attackInterval += adjective.modifiers.attackInterval;
    }

    instance.roomId = roomId;

    this.displayName = this.buildDisplayName();

    return instance;
  }

  buildDisplayName() {
    //const template = this.displayTemplate || '${this.adjective} ${this.name} ${this.class}';
    const template = this.displayTemplate || '${this.name}';
    return new Function(`return \`${template}\`;`).call(this);
  }

  look() {
    return Promise.resolve(this.desc);
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
    global.io.to(room.id).emit('output', { message: `<span class="yellow">The ${this.displayName} collapses.</span>` });
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

  selectTarget() {

    if (this.attackInterval === 0) return;

    const room = Room.getById(this.roomId);
    const charactersInRoom = room.getCharacters();

    // select random player to attack
    if (charactersInRoom.length == 0) return;
    const targetIndex = dice.getRandomNumber(0, charactersInRoom.length);
    const targetCharacter = charactersInRoom[targetIndex];
    this.attackTarget = targetCharacter.id;
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

    let character = socketUtil.getCharacterById(this.attackTarget);
    if (!character) return false;

    if (character.roomId !== this.roomId) {
      this.attackTarget = null;
      return false;
    }

    this.lastAttack = now;
    const dmg = 0;
    let playerMessage = '';
    let roomMessage = '';

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

    this.attackTarget = null;

    return true;
  }

  taunt(now) {
    if (!this.readyToTaunt(now)) return;
    this.lastTaunt = now;

    this.selectTarget();

    if (!this.attackTarget) return;

    const socket = socketUtil.getSocketByCharacterId(this.attackTarget);
    if (!socket) {
      return;
    }

    if (socket.character.roomId !== this.roomId) {
      this.attackTarget = null;
      return;
    }

    const tauntIndex = dice.getRandomNumber(0, this.taunts.length);
    let taunt = this.taunts[tauntIndex];
    taunt = utils.formatMessage(taunt, this.displayName, 'you');
    let charName = socket.character.name;
    let roomTaunt = utils.formatMessage(this.taunts[tauntIndex], this.displayName, charName);
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
    return !!this.attackInterval && this.attackTarget && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
  }

  readyToTaunt(now) {
    return !!this.tauntInterval && (!this.lastTaunt || this.lastTaunt + this.tauntInterval <= now);
  }

  readyToIdle(now) {
    return !!this.idleInterval && (!this.lastIdle || this.lastIdle + this.idleInterval <= now);
  }
}

export default Mob;
