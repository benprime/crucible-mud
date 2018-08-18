import mongoose from 'mongoose';
import config from '../config';
import ItemSchema from './itemSchema';
import dice from '../core/dice';

const CharacterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: String },

  inventory: [ItemSchema],
  keys: [ItemSchema],
  currency: { type: Number },
  equipSlots: {
    // Weapons
    weaponMain: ItemSchema,
    weaponOff: ItemSchema,

    // Armor/Gear
    head: ItemSchema,
    body: ItemSchema,
    back: ItemSchema,
    legs: ItemSchema,
    feet: ItemSchema,
    arms: ItemSchema,
    hands: ItemSchema,
    neck: ItemSchema,
    fingerMain: ItemSchema,
    fingerOff: ItemSchema,
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
    strength: { type: Number },
    intelligence: { type: Number },
    dexterity: { type: Number },
    charisma: { type: Number },
    constitution: { type: Number },
    willpower: { type: Number },
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

export default CharacterSchema;
