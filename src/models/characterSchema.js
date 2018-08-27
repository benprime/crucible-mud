import mongoose from 'mongoose';
import config from '../config';
import ItemSchema from './itemSchema';
import Room from './room';
import dice from '../core/dice';
import socketUtil from '../core/socketUtil';

const CharacterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  roomId: { type: String },

  inventory: [ItemSchema],
  keys: [ItemSchema],
  currency: { type: Number, default: 0 },
  equipSlots: {
    // Weapons
    weaponMain: String,
    weaponOff: String,

    // Armor/Gear
    head: String,
    body: String,
    back: String,
    legs: String,
    feet: String,
    arms: String,
    hands: String,
    neck: String,
    fingerMain: String,
    fingerOff: String,
  },
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
    // ability to not be seen/heard (DEX)
    stealth: { type: Number },
    // open non-magical locks (DEX)
    lockpick: { type: Number },
    // steal from others (DEX)
    pickpocket: { type: Number },
    // visual (hidden door, trap, etc) (INT)
    search: { type: Number },
    // magical (active spell, illusion, etc) (INT/WIL)
    detect: { type: Number },
    // auditory (sounds beyond door, wind outside cave entrance, etc) (INT)
    listen: { type: Number },
    // determine hidden qualities of objects (INT)
    identify: { type: Number },
    // eliminate traps (DEX)
    disable: { type: Number },
    // make deals with others (CHA)
    negotiate: { type: Number },
    // mislead/swindle others (CHA)
    bluff: { type: Number },
    // force others to comply through fear (STR/CHA)
    intimidate: { type: Number },
    // affinity/skill with magic (INT/WIL)
    magic: { type: Number },
    // affinity/skill with weapons (STR/DEX)
    weapons: { type: Number },
    // subweapon skills? (dual, ranged, one hand, two hand, pierce, slash, bludge)
    // hide objects (DEX)
    conceal: { type: Number },
    // minor self heal (CON)
    heal: { type: Number },
    // minor self revitalization of energy (WIL)
    refresh: { type: Number },
    // survive what others cannot (resist poison, no KO, etc) (CON)
    endure: { type: Number },
    // shield from magic (resist spell, see through illusion/charm, etc) (WIL)
    resist: { type: Number },
  },
}, { usePushEach: true });

CharacterSchema.statics.findByName = function (name) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ name: userRegEx }).populate('user');
};

CharacterSchema.statics.findByUser = function (user) {
  return this.findOne({ user: user });
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

CharacterSchema.methods.attack = function (socket, mob, now) {
  if (!this.readyToAttack(now)) return;
  if (!mob) return;
  this.lastAttack = now;

  let actorMessage = '';
  let roomMessage = '';
  const playerDmg = 5; // dice.roll(this.actionDie) + this.strength;

  let attackResult = this.attackroll();

  if (attackResult == 2) {
    actorMessage = `<span class="${config.DMG_COLOR}">You hit ${mob.displayName} for ${playerDmg} damage!</span>`;
    roomMessage = `<span class="${config.DMG_COLOR}">The ${this.username} hits ${mob.displayName} for ${playerDmg} damage!</span>`;
  } else {
    actorMessage = `<span class="${config.MSG_COLOR}">You swing at the ${mob.displayName} but miss!</span>`;
    roomMessage = `<span class="${config.MSG_COLOR}">${this.username} swings at the ${mob.displayName} but misses!</span>`;
  }

  socket.emit('output', { message: actorMessage });
  socket.broadcast.to(this.roomId).emit('output', { message: roomMessage });

  if (attackResult == 2) {
    mob.takeDamage(playerDmg);
  }
};

CharacterSchema.methods.break = function () {
  this.attackInterval = undefined;
  this.lastAttack = undefined;
  this.attackTarget = undefined;
};

CharacterSchema.methods.move = function (dir) {
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

CharacterSchema.methods.teleport = function (roomId) {
  if (this.roomId === roomId) {
    return Promise.reject('Character is already here.');
  }

  // todo: remove the socket writes, as this method could be used
  // for different reasons, not all of which is an actual teleport.
  this.break();
  const socket = socketUtil.getSocketByCharacterId(this.id);

  //socketUtil.roomMessage(socket, `${this.name} vanishes!`, [socket.id]);
  if (socket) {
    socket.leave(this.roomId);
    socket.join(roomId);
  }

  this.roomId = roomId;

  // npcs don't save to database on every move
  if (socket) {
    this.save(err => { if (err) throw err; });
  }
  return Promise.resolve({
    charMessages: [{ charId: this.id, message: 'You teleport...\n' }],
    roomMessages: [{ roomId: roomId, message: `<span class="yellow">${this.name} appears out of thin air!</span>`, exclude: [this.id] }],
  });
};

CharacterSchema.methods.output = function (msg) {
  const socket = socketUtil.getSocketByCharacterId(this.id);
  if (socket) {
    socket.emit('output', { message: msg });
  }
};







//==============================================
// Inventory manager?
//==============================================

const equipSlots = Object.freeze([
  'weaponMain',
  'weaponOff',
  'head',
  'body',
  'back',
  'legs',
  'feet',
  'arms',
  'hands',
  'neck',
  'fingerMain',
  'fingerOff',
]);

CharacterSchema.methods.unequip = function (item) {
  let unequipItemIds = this.unequipSlotsForItem(item);
  if (unequipItemIds.length === 0) {
    this.output('You don\'t have that item equipped.');
  }
};

CharacterSchema.methods.unequipSlotsForItem = function (item) {
  const itemIds = [];
  item.equip.forEach(slot => {
    let equippedItemId = this.equipSlots[slot];
    if (equippedItemId) {
      this.unequipItemById(equippedItemId);
      itemIds.push(equippedItemId);
    }
  });

  itemIds.forEach(itemId => {
    let itemName = this.inventory.find(i => i.id === itemId).displayName;
    this.output(`${itemName} unequipped.`);
  });

  return itemIds;
};

CharacterSchema.methods.unequipItemById = function (itemId) {
  equipSlots.forEach(key => {
    if (this.equipSlots[key] === itemId) {
      this.equipSlots[key] = null;
    }
  });
};

CharacterSchema.methods.equipped = function (item) {
  for (let slot of equipSlots) {
    if (this.equipSlots[slot] === item.id) {
      return true;
    }
  }
  return false;
};

CharacterSchema.methods.equip = function (item) {

  if (this.equipped(item)) {
    this.output(`${item.displayName} already equipped.`);
    return;
  }

  this.unequipSlotsForItem(item);

  item.equip.forEach(slot => this.equipSlots[slot] = item.id);

  this.output(`${item.displayName} equipped.`);
};


export default CharacterSchema;
