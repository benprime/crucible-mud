import mongoose from 'mongoose';
import { upperCaseWords, indefiniteArticle, pronounSubject, pronounPossessive, oxfordComma } from '../core/language';

const CharacterEquipSchema = new mongoose.Schema({
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
}, { usePushEach: true, id: false, _id: false });

CharacterEquipSchema.statics.slotNames = function () {
  return Object.keys(this.schema.paths).filter(i => i !== '_id');
};

CharacterEquipSchema.methods.unequip = function (item) {
  if (!item || !this.isEquipped(item)) {
    this.$parent.output('You don\'t have that item equipped.');
    return;
  }

  this.unequipSlotsForItem(item);

};

CharacterEquipSchema.methods.unequipSlotsForItem = function (item) {
  const itemIds = [];
  item.equipSlots.forEach(slot => {
    let equippedItemId = this[slot];
    if (equippedItemId) {
      this.unequipItemById(equippedItemId);
      itemIds.push(equippedItemId);
    }
  });

  // when unequipping slots to equip a multi-slot item,
  // print out unequip messages for each unique item.
  itemIds.forEach(itemId => {
    let itemName = this.$parent.inventory.find(i => i.id === itemId).name;
    this.$parent.output(`${itemName} unequipped.`);
  });
};

CharacterEquipSchema.methods.unequipItemById = function (itemId) {
  this.constructor.slotNames().forEach(key => {
    if (this[key] === itemId) {
      this[key] = null;
    }
  });
};

CharacterEquipSchema.methods.isEquipped = function (item) {
  for (let slot of this.constructor.slotNames()) {
    if (this[slot] === item.id) {
      return true;
    }
  }
  return false;
};

CharacterEquipSchema.methods.equip = function (item, inventory) {

  if (this.isEquipped(item)) {
    this.$parent.output(`${item.name} already equipped.`);
    return;
  }

  this.unequipSlotsForItem(item, inventory);
  item.equipSlots.forEach(slot => this[slot] = item.id);
  this.$parent.output(`${item.name} equipped.`);

  if (['weaponMain', 'weaponOff'].includes(item.equipSlots[0])) {
    this.$parent.toRoom(`${this.$parent.name} is now wielding ${indefiniteArticle(item.name)} ${item.name}.`);
  } else {
    this.$parent.toRoom(`${this.$parent.name} wears ${item.name}.`);
  }

};

CharacterEquipSchema.methods.unequipAll = function () {
  this.constructor.slotNames().forEach(slotName => this[slotName] = undefined);
};

CharacterEquipSchema.methods.weaponName = function (weaponId) {
  const weapon = this.$parent.inventory.id(weaponId);
  return weapon ? weapon.name : '';
};

CharacterEquipSchema.methods.getDesc = function () {

  const output = [];

  let pSubject = pronounSubject(this.$parent.gender);
  let upSubject = upperCaseWords(pSubject);
  let upObject = upperCaseWords(pSubject);
  let pPossessive = pronounPossessive(this.$parent.gender);

  const weaponMainName = this.weaponName(this.weaponMain) || '';
  const weaponOffName = this.weaponName(this.weaponOff) || '';

  const headName = this.weaponName(this.head) || '';
  const bodyName = this.weaponName(this.body) || '';
  const backName = this.weaponName(this.back) || '';
  const legsName = this.weaponName(this.legs) || '';
  const feetName = this.weaponName(this.feet) || '';
  const armsName = this.weaponName(this.arms) || '';
  const handsName = this.weaponName(this.hands) || '';
  const neckName = this.weaponName(this.neck) || '';
  const fingerMain = this.weaponName(this.fingerMain) || '';
  const fingerOff = this.weaponName(this.fingerOff) || '';

  // weapons
  let weaponOutput = upObject;
  if (weaponMainName || weaponOffName) {
    weaponOutput += ' is holding ';
    if (weaponMainName) weaponOutput += `${indefiniteArticle(weaponMainName)} ${weaponMainName}`;
    if (weaponMainName && weaponOffName && weaponMainName !== weaponOffName) weaponOutput += ' and ';
    if (weaponOffName && weaponMainName !== weaponOffName) weaponOutput += `${indefiniteArticle(weaponOffName)} ${weaponOffName}`;
  } else {
    weaponOutput += ' is unarmed';
  }
  weaponOutput += '.';
  output.push(weaponOutput);

  // headwear
  if (headName) output.push(`On ${pPossessive} head ${pSubject} wears ${indefiniteArticle(headName)} ${headName}.`);

  // upper body
  const body = [];
  if (bodyName) body.push(bodyName);
  if (armsName) body.push(armsName);
  if (handsName) body.push(handsName);
  if (legsName) body.push(legsName);
  if (feetName) body.push(feetName);

  if (body.length > 0) {
    const bodyString = oxfordComma(body);
    output.push(`${upObject} is wearing ${bodyString}.`);
  }

  // back
  if (backName) output.push(`${upperCaseWords(indefiniteArticle(headName))} ${backName} falls behind him.`);

  // jewelery
  let jewelery = [];
  if (neckName) jewelery.push(neckName);
  if (fingerMain) jewelery.push(fingerMain);
  if (fingerOff) jewelery.push(fingerOff);

  if (jewelery.length > 0) {
    jewelery = jewelery.map(s => s = `${indefiniteArticle(s)} ${s}`);
    const jeweleryString = oxfordComma(jewelery);
    output.push(`${upSubject} is adorned with ${jeweleryString}.`);
  }

  return output.join(' ');
};

export default CharacterEquipSchema;
