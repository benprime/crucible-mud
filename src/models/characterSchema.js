import mongoose from 'mongoose';
import config from '../config';
import ItemSchema from './itemSchema';
import Room from './room';
import dice from '../core/dice';
import socketUtil from '../core/socketUtil';
import CharacterEquipSchema from './characterEquipSchema';
import { updateHUD } from '../core/hud';

const CharacterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  roomId: { type: String },

  gender: { type: String, enum: ['male', 'female'], default: 'male' },

  inventory: [ItemSchema],
  keys: [ItemSchema],
  currency: { type: Number, default: 0 },

  equipped: { type: CharacterEquipSchema, default: CharacterEquipSchema },

  armorRating: { type: Number },

  xp: { type: Number },
  level: { type: Number },

  maxHP: { type: Number },
  currentHP: { type: Number },

  actionDie: {  // base die for all of player's action results to add variance
    type: String,
  },

  stats: {
    strength: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },
    constitution: { type: Number, default: 10 },
    willpower: { type: Number, default: 10 },
  },

  skills: {

    stealth: { type: Number }, // ability to not be seen/heard (DEX)
    lockpick: { type: Number }, // open non-magical locks (DEX)
    pickpocket: { type: Number }, // steal from others (DEX)


    // combine to perception
    search: { type: Number }, // visual (hidden door, trap, etc) (INT)
    listen: { type: Number }, // auditory (sounds beyond door, wind outside cave entrance, etc) (INT)
    detect: { type: Number }, // magical (active spell, illusion, etc) (INT/WIL)

    //unarmed?

    identify: { type: Number }, // determine hidden qualities of objects (INT)
    disable: { type: Number }, // eliminate traps (DEX)
    negotiate: { type: Number }, // make deals with others (CHA)
    bluff: { type: Number }, // mislead/swindle others (CHA)
    intimidate: { type: Number }, // force others to comply through fear (STR/CHA)
    magic: { type: Number }, // affinity/skill with magic (INT/WIL)
    weapons: { type: Number }, // affinity/skill with weapons (STR/DEX) // subweapon skills? (dual, ranged, one hand, two hand, pierce, slash, bludge)

    conceal: { type: Number }, // hide objects (DEX)
    heal: { type: Number }, // minor self heal (CON)

    refresh: { type: Number }, // minor self revitalization of energy (WIL)

    endure: { type: Number }, // survive what others cannot (resist poison, no KO, etc) (CON)

    resist: { type: Number }, // shield from magic (resist spell, see through illusion/charm, etc) (WIL)
  },
}, { usePushEach: true });

//============================================================================
// Statics
//============================================================================
CharacterSchema.statics.findByName = function (name) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ name: userRegEx }).populate('user');
};

CharacterSchema.statics.findByUser = function (user) {
  return this.findOne({ user: user });
};

//============================================================================
// Instance methods
//============================================================================
CharacterSchema.methods.getDesc = function () {
  // todo: Add character specific detaisl. Currently only returning the description of equipped items.
  return this.equipped.getDesc();
};

CharacterSchema.methods.nextExp = function () {
  const BASE_XP = 300;
  const BASE_RATE = 1;
  return BASE_XP * ((1 + BASE_RATE) ** (this.level - 1));
};

CharacterSchema.methods.addExp = function (amount) {
  this.xp += amount;
  while (this.xp >= this.nextExp()) {
    this.level++;
  }
  this.save(err => { if (err) throw err; });
};

CharacterSchema.methods.readyToAttack = function (now) {
  return this.attackTarget && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
};

CharacterSchema.methods.attackroll = () => /*
/* UserSchema.methods.attackroll = weapon => 
var wdParts = weapon.damage.spltest(" ");

if(!weapon) {
  return this.strengh + (dice.roll(this.actionDie) - 2);  --bare fist
}
if(weapon.range = 'melee') {
  return this.strengh + dice.roll(wdParts[0]) + wdParts[1];
}
console.log('attackroll weapon resolution error');
return 0;
*/

  // just return 0 or 1 for now
  dice.roll('1d2');

CharacterSchema.methods.attack = function (mob, now) {
  if (!this.readyToAttack(now)) return;
  if (!mob) return;
  this.lastAttack = now;

  let actorMessage = '';
  let roomMessage = '';
  const playerDmg = 5; // dice.roll(this.actionDie) + this.strength;

  let attackResult = this.attackroll();

  if (attackResult == 2) {
    actorMessage = `<span class="${config.DMG_COLOR}">You hit ${mob.name} for ${playerDmg} damage!</span>`;
    roomMessage = `<span class="${config.DMG_COLOR}">The ${this.username} hits ${mob.name} for ${playerDmg} damage!</span>`;
  } else {
    actorMessage = `<span class="${config.MSG_COLOR}">You swing at the ${mob.name} but miss!</span>`;
    roomMessage = `<span class="${config.MSG_COLOR}">${this.username} swings at the ${mob.name} but misses!</span>`;
  }

  this.output(actorMessage);
  this.toRoom(roomMessage);

  if (attackResult == 2) {
    mob.takeDamage(playerDmg);
  }
};

CharacterSchema.methods.processEndOfRound = function (round) {
  
  if (this.bleeding) {

    // take damage every 4 rounds
    if(this.bleeding % 4 === 0) {
      this.output('<span class="firebrick">You are bleeding!</span>');
      this.toRoom(`<span class="firebrick">${this.name} is bleeding out!</span>`);
      this.takeDamage(1);
    }
    this.bleeding++;
  }
};

CharacterSchema.methods.isIncompacitated = function () {
  if (this.currentHP <= 0) {
    return true;
  }
  return false;
};

CharacterSchema.methods.die = function () {
  // todo: this will be configuration to a church location
  this.break();
  Room.getByCoords({ x: 0, y: 0, z: 0 }).then(room => {
    this.teleport(room.id);
    this.currentHP = this.maxHP;
    this.bleeding = false;
    this.output('You have died!\nYou have been resurrected.');
    const socket = socketUtil.getSocketByCharacterId(this.id);
    updateHUD(socket);
  });
};

CharacterSchema.methods.takeDamage = function (damage) {
  const wasStanding = this.currentHP > 0;
  this.currentHP -= damage;
  if (this.currentHP <= 0) {
    if (wasStanding) {
      this.break();
      this.output('<span class="firebrick">You are incompacitated!</span>\n');
      this.toRoom(`<span class="firebrick">${this.name} drops to the ground!</span>\n`);
    }
    this.bleeding = 1;
  }
  const socket = socketUtil.getSocketByCharacterId(this.id);
  updateHUD(socket);
  if (this.currentHP <= -15) {
    this.die();
  }

  this.save();
};

CharacterSchema.methods.break = function () {
  this.attackInterval = undefined;
  this.lastAttack = undefined;
  this.attackTarget = undefined;
};

CharacterSchema.methods.move = function (dir) {
  if (this.isIncompacitated()) {
    return Promise.reject('<span class="firebrick">You are incompacitated!</span>\n');
  }
  const fromRoom = Room.getById(this.roomId);
  const socket = socketUtil.getSocketByCharacterId(this.id);

  return fromRoom.IsExitPassable(this, dir).then((exit) => {
    const toRoom = Room.getById(exit.roomId);
    this.break();

    if (socket) {
      const displayDir = Room.shortToLong(dir);
      socket.emit('output', { message: `You move ${displayDir}...` });
    }

    fromRoom.leave(this, dir, socket);
    const enterDir = Room.oppositeDirection(dir);
    toRoom.enter(this, enterDir, socket);

    let followers = socketUtil.getFollowingCharacters(socket.character.id);
    followers.forEach(c => {
      c.move(dir);
    });

    return Promise.resolve(toRoom);
  });
};

CharacterSchema.methods.teleport = function (roomTarget) {

  // get by id or alias
  const room = Room.getById(roomTarget);
  if (!room) {
    return Promise.reject('Invalid roomId');
  }

  if (this.roomId === room.id) {
    return Promise.reject('Character is already here.');
  }

  // todo: remove the socket writes, as this method could be used
  // for different reasons, not all of which is an actual teleport.
  this.break();
  const socket = socketUtil.getSocketByCharacterId(this.id);

  //socketUtil.roomMessage(socket, `${this.name} vanishes!`, [socket.id]);
  if (socket) {
    socket.leave(this.roomId);
    socket.join(room.id);
  }

  this.roomId = room.id;

  // npcs don't save to database on every move
  if (socket) {
    this.save(err => { if (err) throw err; });
  }
  return Promise.resolve({
    charMessages: [{ charId: this.id, message: 'You teleport...\n' }],
    roomMessages: [{ roomId: roomTarget, message: `<span class="yellow">${this.name} appears out of thin air!</span>`, exclude: [this.id] }],
  });
};

CharacterSchema.methods.output = function (msg) {
  const socket = socketUtil.getSocketByCharacterId(this.id);
  if (socket) {
    socket.emit('output', { message: msg });
  }
};

CharacterSchema.methods.toRoom = function (msg) {
  const socket = socketUtil.getSocketByCharacterId(this.id);
  if (socket) {
    socket.to(this.roomId).emit('output', { message: msg });
  }
};

CharacterSchema.methods.status = function() {
  const quotient = this.currentHP / this.maxHP;
  let status = 'unharmed';

  if(quotient <= 0) {
    status = '<span class="red">incapacitated</span>';
  }
  else if(quotient <= 0.33) {
    status = '<span class="firebrick">severely wounded</span>';
  }
  else if(quotient <= 0.66) {
    status = '<span class="yellow">moderately wounded</span>';
  }
  else if(quotient < 1) {
    status = '<span class="olive">lightly wounded</span>';
  }
  return status;
};

export default CharacterSchema;
