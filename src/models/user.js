/* todo: rename this model to character or something */

import mongoose from 'mongoose';

import config from '../config';
import ItemSchema from './itemSchema';
import dice from '../core/dice';

const UserSchema = new mongoose.Schema({
  // User info
  email: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  // todo: hash this
  password: {
    type: String,
  },
  admin: {
    type: Boolean,
  },
  // Character info
  roomId: {
    type: String,
  },
  inventory: [ItemSchema],
  keys: [ItemSchema],
  equipSlots: {
    //Weapons
    weaponMain: ItemSchema,
    weaponOff: ItemSchema,
    //Armor/Gear
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
  //Character stats
  xp: {
    type: Number,
  },
  level: {
    type: Number,
  },
  currency: {
    type: Number,
  },
  maxHP: {
    type: Number,
  },
  currentHP: {
    type: Number,
  },
  actionDie: {  // base die for all of player's action results to add variance
    type: String,
  },
  armorRating: {
    type: Number,
  },
  // base stats
  strength: {
    type: Number,
  },
  intelligence: {
    type: Number,
  },
  dexterity: {
    type: Number,
  },
  charisma: {
    type: Number,
  },
  constitution: {
    type: Number,
  },
  willpower: {
    type: Number,
  },
  // skills
  stealth: {  //ability to not be seen/heard (DEX)
    type: Number,
  },
  lockpick: { //open non-magical locks (DEX)
    type: Number,
  },
  pickpocket: { //steal from others (DEX)
    type: Number,
  },
  search: { //visual (hidden door, trap, etc) (INT)
    type: Number,
  },
  detect: { //magical (active spell, illusion, etc) (INT/WIL)
    type: Number,
  },
  listen: { //auditory (sounds beyond door, wind outside cave entrance, etc) (INT)
    type: Number,
  },
  identify: { //determine hidden qualities of objects (INT)
    type: Number,
  },
  disable: {  //eliminate traps (DEX)
    type: Number,
  },
  negotiate: {  //make deals with others (CHA)
    type: Number,
  },
  bluff: {  //mislead/swindle others (CHA)
    type: Number,
  },
  intimidate: { //force others to comply through fear (STR/CHA)
    type: Number,
  },
  magic: {  //affinity/skill with magic (INT/WIL)
    type: Number,
  },
  weapons: {  //affinity/skill with weapons (STR/DEX)
    type: Number,
  },
  //subweapon skills? (dual, ranged, one hand, two hand, pierce, slash, bludge)
  conceal: {  //hide objects (DEX)
    type: Number,
  },
  heal: { //minor self heal (CON)
    type: Number,
  },
  refresh: { //minor self revitalization of energy (WIL)
    type: Number,
  },
  endure: { //survive what others cannot (resist poison, no KO, etc) (CON)
    type: Number,
  },
  resist: { //shield from magic (resist spell, see through illusion/charm, etc) (WIL)
    type: Number,
  },
});

UserSchema.statics.findByName = function (name, cb) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ username: userRegEx }, cb);
};

UserSchema.methods.nextExp = function () {
  const BASE_XP = 300;
  const BASE_RATE = 1;
  return BASE_XP * ((1 + BASE_RATE) ** (this.level - 1));
};

UserSchema.methods.addExp = function (amount) {
  this.xp += amount;
  while (this.xp >= this.nextExp()) {
    this.level++;
  }
  this.save(err => { if (err) throw err; });
};

UserSchema.methods.readyToAttack = function (now) {
  return this.attackTarget && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
};

UserSchema.methods.attackroll = weapon => /*
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

UserSchema.methods.attack = function (socket, mob, now) {
  if (!mob) return;
  this.lastAttack = now;

  let actorMessage = '';
  let roomMessage = '';
  const playerDmg = 5; //dice.roll(this.actionDie) + this.strength;

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
    mob.takeDamage(socket, playerDmg);
  }
};

const User = mongoose.model('User', UserSchema);

export default User;
