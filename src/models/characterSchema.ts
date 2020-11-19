/** @module models/CharacterSchema */
import mongoose from 'mongoose';
import config from '../config';
import ItemSchema from './itemSchema';
import Room from './room';
import dice from '../core/dice';
import socketUtil from '../core/socketUtil';
import characterStates, { stateMode } from '../core/characterStates';
import CharacterEquipSchema from './characterEquipSchema';
import { updateHUD } from '../core/hud';
import { pronounSubject, upperCaseWords, verbToThirdPerson } from '../core/language';
import { HealthStatus } from '../models/enums/healthStatuses';
import actionHandler from '../core/actionHandler';

/**
 * @constructor
 */
const CharacterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  roomId: String,

  gender: { type: String, enum: ['male', 'female'], default: 'male' },

  inventory: [ItemSchema],
  keys: [ItemSchema],
  currency: Number,

  equipped: {
    type: CharacterEquipSchema,
    default: () => ({}),
  },

  armorRating: Number,

  xp: Number,
  level: Number,

  maxHP: Number,
  currentHP: Number,

  actionDie: String,  // base die for all of player's action results to add variance
  attacksPerRound: Number,

  stats: {
    strength: Number,
    intelligence: Number,
    dexterity: Number,
    charisma: Number,
    constitution: Number,
    willpower: Number,
  },

  skills: {

    stealth: Number, // ability to not be seen/heard (DEX)
    lockpick: Number, // open non-magical locks (DEX)
    pickpocket: Number, // steal from others (DEX)


    // combine to perception
    search: Number, // visual (hidden door, trap, etc) (INT)
    listen: Number, // auditory (sounds beyond door, wind outside cave entrance, etc) (INT)
    detect: Number, // magical (active spell, illusion, etc) (INT/WIL)

    //unarmed?

    identify: Number, // determine hidden qualities of objects (INT)
    disable: Number, // eliminate traps (DEX)
    negotiate: Number, // make deals with others (CHA)
    bluff: Number, // mislead/swindle others (CHA)
    intimidate: Number, // force others to comply through fear (STR/CHA)
    magic: Number, // affinity/skill with magic (INT/WIL)
    weapons: Number, // affinity/skill with weapons (STR/DEX) // subweapon skills? (dual, ranged, one hand, two hand, pierce, slash, bludge)

    conceal: Number, // hide objects (DEX)
    heal: Number, // minor self heal (CON)

    refresh: Number, // minor self revitalization of energy (WIL)

    endure: Number, // survive what others cannot (resist poison, no KO, etc) (CON)

    resist: Number, // shield from magic (resist spell, see through illusion/charm, etc) (WIL)
  },
}, { usePushEach: true });

//============================================================================
// Statics
//============================================================================

/**
 * Finds a connected character.
 * @param {String} name - name of the character to find
 * @memberof module:models~Character
 */
CharacterSchema.statics.findByName = function (name) {
  const userRegEx = new RegExp(`^${name}$`, 'i');
  return this.findOne({ name: userRegEx }).populate('user');
};

CharacterSchema.statics.findByUserId = function (userId) {
  return this.findOne({ user: userId });
};

//============================================================================
// Instance methods
//============================================================================
CharacterSchema.methods.setupEvents = function () {
  //todo: add a way to unsubscribe these emitters on logout
  this.on('action', this.action);
};

CharacterSchema.methods.action = function (actionInfo) {
  const action = actionHandler.actions[actionInfo.actionName];
  if (!action || !action.execute) {
    throw (`Cannot find valid action with name: ${actionInfo.actionName}`);
  }

  if (this.processStates(action.category)) {
    action.execute(this, ...actionInfo.actionParams);
  }
};

CharacterSchema.methods.getDesc = function () {
  // todo: Add character specific details. Currently only returning the description of equipped items.
  let output = this.equipped.getDesc();
  const pronoun = upperCaseWords(pronounSubject(this.gender));
  output += `\n${pronoun} is ${this.status()}.`;
  if (this.hasState(characterStates.BLEEDING)) {
    output += `<span class="red">${this.name} is bleeding out!</span>\n`;
  }
  output += '\n';
  return output;
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



// TODO: perhaps have miss verbs per weapon type also: "thrusts at, stabs at" in addition to "swings at"
CharacterSchema.methods.getAttackVerb = function (weapon) {
  const damageType = weapon ? weapon.damageType : 'unarmed';
  const attackVerbs = {
    'slashing': ['slash', 'stab', 'cut', 'hack', 'chop', 'cleave'],
    'piercing': ['pierce', 'stick', 'stab', 'impale', 'skewer', 'spear', 'lance', 'thrust'],
    'bludgeoning': ['bludgeon', 'club', 'whop', 'swat', 'hit', 'smack', 'smash', 'wallop', 'bash', 'thump'],
    'unarmed': ['uppercut', 'punch', 'sock', 'smack', 'jab', 'slap', 'bash', 'pummel', 'slam', 'slug', 'strike', 'thump'],
  };
  const verbs = attackVerbs[damageType];
  const verbIndex = dice.getRandomNumber(0, verbs.length);
  return verbs[verbIndex];
};

CharacterSchema.methods.attack = function (mob, now) {
  if (!this.readyToAttack(now)) return;
  if (!mob) return;
  this.lastAttack = now;

  let actorMessage = '';
  let roomMessage = '';

  let attackResult = this.attackroll();
  const hit = attackResult === 2;

  // a successful attack
  let weapon;
  if (hit) {
    weapon = this.inventory.id(this.equipped.weaponMain);
    let diceToRoll = weapon ? weapon.damage : '1d2';
    let dmg = dice.roll(diceToRoll); // todo: +STR modifier
    mob.takeDamage(dmg);

    // messages
    const verb = this.getAttackVerb(weapon);
    const thirdPersonVerb = verbToThirdPerson(verb);
    actorMessage = `<span class="${config.DMG_COLOR}">You ${verb} the ${mob.displayName} for ${dmg} damage!</span>`;
    roomMessage = `<span class="${config.DMG_COLOR}">The ${this.name} ${thirdPersonVerb} ${mob.displayName} for ${dmg} damage!</span>`;
  } else {
    actorMessage = `<span class="${config.MSG_COLOR}">You swing at the ${mob.displayName} but miss!</span>`;
    roomMessage = `<span class="${config.MSG_COLOR}">${this.name} swings at the ${mob.displayName} but misses!</span>`;
  }

  this.output(actorMessage);
  this.toRoom(roomMessage);
};

CharacterSchema.methods.processEndOfRound = function (round) {
  this.states.forEach(cs => {
    if (cs.endOfRound) {
      cs.endOfRound(this, round);
    }
  });
};

CharacterSchema.methods.isIncapacitated = function () {
  return this.hasState(characterStates.INCAPACITATED);
};

CharacterSchema.methods.regen = function () {
  // just a hack for now, only players regen.
  if (!this.user) return;

  if (this.currentHP < this.maxHP) {
    if (this.states.includes(characterStates.RESTING)) {
      // poor man's Math.clamp()
      this.currentHP = Math.min(Math.max(this.currentHP + 2, 0), this.maxHP);
    } else {
      this.currentHP++;
    }
    this.updateHUD();
  }
};

CharacterSchema.methods.die = function () {
  this.break();
  this.toRoom(`<span class="firebrick">${this.name} has died!</span>\n`);

  // regenerate user at coordinate location
  const room = Room.getByCoords({ x: 0, y: 0, z: 0 });
  this.teleport(room.id);
  this.currentHP = this.maxHP;
  this.removeState(characterStates.BLEEDING);
  this.output('\n<span class="red">You have died!</span>\n');
  this.output('<span class="yellow">You have been resurrected.</span>\n');
  this.updateHUD();
};

CharacterSchema.methods.updateHUD = function () {
  const socket = socketUtil.getSocketByCharacterId(this.id);
  if (socket) {
    updateHUD(socket);
  }
};

CharacterSchema.methods.takeDamage = function (damage) {
  const characterDrop = this.currentHP > 0;
  this.currentHP -= damage;
  if (this.currentHP <= 0) {
    if (characterDrop) {
      this.break();
      this.setState(characterStates.INCAPACITATED);
      this.output('<span class="firebrick">You are incapacitated!</span>\n');
      this.toRoom(`<span class="firebrick">${this.name} drops to the ground!</span>\n`);
    }
    this.setState(characterStates.BLEEDING);
  }
  this.updateHUD();
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

  return Promise.resolve();
  // return Promise.resolve({
  //   charMessages: [{ charId: this.id, message: 'You teleport...\n' }],
  //   roomMessages: [{ roomId: roomTarget, message: `<span class="yellow">${this.name} appears out of thin air!</span>`, exclude: [this.id] }],
  // });
};

CharacterSchema.methods.output = function (msg, options) {
  const socket = socketUtil.getSocketByCharacterId(this.id);
  if (socket) {
    let payload = { message: msg };
    if (options) {
      Object.assign(payload, options);
    }
    socket.emit('output', payload);
  }
  return msg;
};

CharacterSchema.methods.toRoom = function (msg, exclude) {
  let excludeArr = [this.id];
  if (Array.isArray(exclude)) {
    excludeArr = excludeArr.concat(exclude);
  }
  socketUtil.roomMessage(this.roomId, msg, excludeArr);
};

CharacterSchema.methods.getFollowers = function () {
  return socketUtil.getFollowers(this.id);
};

CharacterSchema.methods.getPartyCharacters = function () {
  let followers = [];
  if (this.leader) {
    const leader = socketUtil.getCharacterById(this.leader);
    followers.push(leader);
    followers = followers.concat(leader.getFollowers());
  } else {
    followers.push(this);
    followers = followers.concat(this.getFollowers());
  }
  return followers;
};

CharacterSchema.methods.toParty = function (msg) {
  const characters = this.getPartyCharacters();
  characters.forEach(c => c.output(msg));
  return true;
};

CharacterSchema.methods.status = function () {

  let status = {
    text : healthStatus.UNHARMED,
    style : 'green',
  };

  const quotient = this.currentHP / this.maxHP;
  if (quotient <= 0) {
    status.text = healthStatus.INCAPACITATED;
    status.style = 'red';
  }
  else if (quotient <= 0.33) {
    status.text = healthStatus.SEVERELY_WOUNDED;
    status.style = 'firebrick';
  }
  else if (quotient <= 0.66) {
    status.text = healthStatus.MODERATELY_WOUNDED;
    status.style = 'yellow';
  }
  else if (quotient < 1) {
    status.text = healthStatus.LIGHTLY_WOUNDED;
    status.style = 'olive';
  }
  return status;
};

CharacterSchema.methods.gossip = function (msg) {
  let safeMessage = msg.replace(/</g, '&lt;');
  safeMessage = safeMessage.replace(/>/g, '&gt;');
  const output = `<span class="silver">${this.name} gossips: </span><span class="mediumOrchid">${safeMessage}</span>`;
  global.io.to('gossip').emit('output', { message: output });
  return Promise.resolve(output);
};

//============================================================================
// Character States - this may get moved to a sub-schema
//============================================================================
CharacterSchema.methods.setState = function (state) {
  if (!Object.values(characterStates).includes(state)) {
    return;
  }
  if (!this.states.includes(state)) {
    this.states.push(state);
    this.updateHUD();
    return true;
  }
  return;
};

CharacterSchema.methods.hasState = function (state) {
  return this.states.includes(state);
};

CharacterSchema.methods.removeState = function (state) {
  if (!Object.values(characterStates).includes(state)) {
    return;
  }

  const sIndex = this.states.findIndex(s => s === state);
  if (sIndex > -1) {
    const removed = this.states.splice(sIndex, 1);
    this.updateHUD();
    return removed;
  }

  return;
};

CharacterSchema.methods.sneakMode = function () {
  return this.hasState(characterStates.SNEAKING);
};

CharacterSchema.methods.update = function () {
  this.states.forEach(cs => {
    if (cs.update) {
      cs.update(this);
    }
  });
};

/**
 * Checks if a command being executed affects a character's current states.
 * @param {Character} character
 * @param {Object} command
 * @returns {Boolean} - Whether or not the command can continue.
 */
CharacterSchema.methods.processStates = function (actionCategory) {

  // if any state restricts the action, we will let that trump deactivating other states.
  // For this reason, we must check all states for action prevention first.
  const restrictStates = this.states.filter(s => s.mode === stateMode.RESTRICT);
  for (let state of restrictStates) {
    if (!state.actionCategories.includes(actionCategory)) {
      if (state.message) {
        // treat a regular string as a template literal
        const msg = new Function(`return \`${state.message}\`;`).call(this);
        this.output(msg);
      }

      // since the action is blocked, we can return immediately
      return false;
    }
  }

  // multiple states can be deactivated in one action, so we must loop through
  // entire array and remove states as they become deactivated.
  const deactivateStates = this.states.filter(s => s.mode === stateMode.DEACTIVATE);
  for (let i = 0; i < deactivateStates.length; i++) {
    let state = deactivateStates[i];

    if (!state.actionCategories.includes(actionCategory)) {
      if (state.message) {
        let msg = new Function(`return \`${state.message}\`;`).call(this);
        this.output(msg);
      }
      deactivateStates.splice(i, 1);
      i--;
      this.removeState(state);
    }
  }

  this.updateHUD();
  return true;
};

export default CharacterSchema;
