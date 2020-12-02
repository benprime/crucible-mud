import config from '../config';
import Room from './room';
import dice from '../core/dice';
import socketUtil from '../core/socketUtil';
import characterStates, { stateMode } from '../core/characterStates';
import { CharacterEquipDocument } from './characterEquip';
import { updateHUD } from '../core/hud';
import { pronounSubject, upperCaseWords, verbToThirdPerson } from '../core/language';
import { HealthStatus } from '../models/enums/healthStatuses';
import actionHandler from '../core/actionHandler';
import { UserDocument } from './user';
import { Gender } from './enums/genders';
import { prop, Ref, getModelForClass, ReturnModelType, DocumentType, modelOptions } from '@typegoose/typegoose';
import { ItemDocument } from './item';
import { StatsDocument } from './stats';
import { SkillsDocument } from './skills';

// todo: why was usePushEach necessary?
@modelOptions({ schemaOptions: { usePushEach: true } })
class CharacterDocument {
  @prop()
  user: Ref<UserDocument>;

  @prop()
  name: string;

  @prop()
  roomId: string;

  @prop({ enum: Gender })
  gender: Gender;

  @prop()
  // TODO: item id only
  inventory: [ItemDocument];

  @prop()
  // TODO: item id only
  keys: [ItemDocument];

  @prop()
  currency: number;

  @prop()
  stats: StatsDocument;

  @prop()
  skills: SkillsDocument;

  @prop()
  equipped: CharacterEquipDocument;

  @prop()
  armorRating: number;

  @prop()
  xp: number;

  @prop()
  level: number;

  @prop()
  maxHP: number;

  @prop()
  currentHP: number;

  @prop()
  actionDie: String;  // base die for all of player's action results to add variance

  @prop()
  attacksPerRound: number;


  //============================================================================
  // Statics
  //============================================================================

  /**
   * Finds a connected character.
   * @param {String} name - name of the character to find
   * @memberof module:models~Character
   */
  public static findByName(this: ReturnModelType<typeof CharacterEquipDocument>, name: string) {
    const userRegEx = new RegExp(`^${name}$`, 'i');
    return this.findOne({ name: userRegEx }).populate('user');
  };

  public static findByUserId(this: ReturnModelType<typeof CharacterEquipDocument>, userId: string) {
    return this.findOne({ user: userId });
  };

  //============================================================================
  // Instance methods
  //============================================================================
  public setupEvents(this: DocumentType<CharacterDocument>) {
    //todo: add a way to unsubscribe these emitters on logout
    this.on('action', this.action);
  };

  public action(this: DocumentType<CharacterDocument>, actionInfo) {
    const action = actionHandler.actions[actionInfo.actionName];
    if (!action || !action.execute) {
      throw (`Cannot find valid action with name: ${actionInfo.actionName}`);
    }

    if (this.processStates(action.category)) {
      action.execute(this, ...actionInfo.actionParams);
    }
  };

  public getDesc(this: DocumentType<CharacterDocument>) {
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

  public nextExp(this: DocumentType<CharacterDocument>) {
    const BASE_XP = 300;
    const BASE_RATE = 1;
    return BASE_XP * ((1 + BASE_RATE) ** (this.level - 1));
  };

  public addExp(this: DocumentType<CharacterDocument>, amount: number) {
    this.xp += amount;
    while (this.xp >= this.nextExp()) {
      this.level++;
    }
    this.save(err => { if (err) throw err; });
  };

  public readyToAttack(this: DocumentType<CharacterDocument>, now: Date) {
    return this.attackTarget && (!this.lastAttack || this.lastAttack + this.attackInterval <= now);
  };

  public attackroll = () => /*
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
  public getAttackVerb(this: DocumentType<CharacterDocument>, weapon) {
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

  public attack(this: DocumentType<CharacterDocument>, mob, now) {
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

  public processEndOfRound(this: DocumentType<CharacterDocument>, round) {
    this.stats.forEach(cs => {
      if (cs.endOfRound) {
        cs.endOfRound(this, round);
      }
    });
  };

  public isIncapacitated(this: DocumentType<CharacterDocument>) {
    return this.hasState(characterStates.INCAPACITATED);
  };

  public regen(this: DocumentType<CharacterDocument>) {
    // just a hack for now, only players regen.
    if (!this.user) return;

    if (this.currentHP < this.maxHP) {
      if (this.stats.includes(characterStates.RESTING)) {
        // poor man's Math.clamp()
        this.currentHP = Math.min(Math.max(this.currentHP + 2, 0), this.maxHP);
      } else {
        this.currentHP++;
      }
      this.updateHUD();
    }
  };

  public die(this: DocumentType<CharacterDocument>) {
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

  public updateHUD(this: DocumentType<CharacterDocument>) {
    const socket = socketUtil.getSocketByCharacterId(this.id);
    if (socket) {
      updateHUD(socket);
    }
  };

  public takeDamage(this: DocumentType<CharacterDocument>, damage) {
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

  public break(this: DocumentType<CharacterDocument>) {
    this.attackInterval = undefined;
    this.lastAttack = undefined;
    this.attackTarget = undefined;
  };

  public teleport(this: DocumentType<CharacterDocument>, roomTarget) {

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

  public output(this: DocumentType<CharacterDocument>, msg: string, options?: object) {
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

  public toRoom(this: DocumentType<CharacterDocument>, msg:string, exclude?:string[]) {
    let excludeArr = [this.id];
    if (Array.isArray(exclude)) {
      excludeArr = excludeArr.concat(exclude);
    }
    socketUtil.roomMessage(this.roomId, msg, excludeArr);
  };

  public getFollowers(this: DocumentType<CharacterDocument>) {
    return socketUtil.getFollowers(this.id);
  };

  public getPartyCharacters(this: DocumentType<CharacterDocument>) {
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

  public toParty(this: DocumentType<CharacterDocument>, msg) {
    const characters = this.getPartyCharacters();
    characters.forEach(c => c.output(msg));
    return true;
  };

  public status(this: DocumentType<CharacterDocument>) {

    let status = {
      text: HealthStatus.UNHARMED,
      style: 'green',
    };

    const quotient = this.currentHP / this.maxHP;
    if (quotient <= 0) {
      status.text = HealthStatus.INCAPACITATED;
      status.style = 'red';
    }
    else if (quotient <= 0.33) {
      status.text = HealthStatus.SEVERELY_WOUNDED;
      status.style = 'firebrick';
    }
    else if (quotient <= 0.66) {
      status.text = HealthStatus.MODERATELY_WOUNDED;
      status.style = 'yellow';
    }
    else if (quotient < 1) {
      status.text = HealthStatus.LIGHTLY_WOUNDED;
      status.style = 'olive';
    }
    return status;
  };

  public gossip(this: DocumentType<CharacterDocument>, msg) {
    let safeMessage = msg.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');
    const output = `<span class="silver">${this.name} gossips: </span><span class="mediumOrchid">${safeMessage}</span>`;
    global.io.to('gossip').emit('output', { message: output });
    return Promise.resolve(output);
  };
}

const CharacterEquipModel = getModelForClass(CharacterEquipDocument);
export { CharacterEquipModel, CharacterDocument }
