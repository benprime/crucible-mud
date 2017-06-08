/* todo: rename this model to character or something */

'use strict';

const mongoose = require('mongoose');
const ItemSchema = require('./itemSchema');
const dice = require('../dice');

const UserSchema = new mongoose.Schema({

//User info
  email: {
    type: String,
    unique: true
  },

  username: {
    type: String,
    unique: true
  },

  // todo: hash this
  password: {
    type: String,
  },

  admin: {
    type: Boolean,
  },



//Character info
  roomId: {
    type: mongoose.Schema.ObjectId,
  },
  /*
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room'
  }
  */

  inventory: [ItemSchema],

  keys: [],

//Character stats
  xp: {
    type: Number,
  },

  level: {
    type: Number,
  },

  maxHP: {
    type: Number,
  },

  currentHP: {
    type: Number,
  },

  //base die for all of player's action results to add variance
  actionDie: {
    type: String,
  },

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

});

UserSchema.statics.findByName = function(name, cb) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ username: userRegEx }, cb);
};

UserSchema.methods.nextExp = function() {
  const BASE_XP = 300;
  const BASE_RATE = 1;
  return BASE_XP * Math.pow(1 + BASE_RATE, this.level);
};

UserSchema.methods.addExp = function(amount) {
  this.xp += amount;
  while(this.xp >= this.nextExp()) {
    this.level++;
  }
  this.save();
};

UserSchema.methods.readyToAttack = function(now) {
  return this.attackTarget && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
};

UserSchema.methods.attackRoll = function() {
  // just return 0 or 1 for now
  return dice.Roll('1d2');
};

UserSchema.methods.attack = function(socket, mob, now) {
  if(!mob) return;
  this.lastAttack = now;

  let actorMessage = '';
  let roomMessage = '';
  const playerDmg = 5; //dice.Roll(this.actionDie) + this.strength;

  let attackResult = this.attackRoll();

  if (attackResult == 2) {
    actorMessage = `<span class="${global.DMG_COLOR}">You hit ${mob.displayName} for ${playerDmg} damage!</span>`;
    roomMessage = `<span class="${global.DMG_COLOR}">The ${this.username} hits ${mob.displayName} for ${playerDmg} damage!</span>`;
  } else {
    actorMessage = `<span class="${global.MSG_COLOR}">You swing at the ${mob.displayName} but miss!</span>`;
    roomMessage = `<span class="${global.MSG_COLOR}">${this.username} swings at the ${mob.displayName} but misses!</span>`;
  }

  socket.emit('output', { message: actorMessage });
  socket.broadcast.to(this.roomId).emit('output', { message: roomMessage });

  if (attackResult == 2) {
    mob.TakeDamage(socket, playerDmg);
    //MobDamage(socket, socket.user.attackTarget, playerDmg);
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
