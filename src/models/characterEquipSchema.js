import mongoose from 'mongoose';

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
}, { usePushEach: true });

CharacterEquipSchema.statics.slotNames = function () {
  return Object.keys(this.schema.paths).filter(i => i !== '_id');
};

CharacterEquipSchema.methods.unequip = function (item) {
  if(!this.isEquipped(item)) {
    this.$parent.output('You don\'t have that item equipped.');
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

  itemIds.forEach(itemId => {
    let itemName = this.$parent.inventory.find(i => i.id === itemId).displayName;
    this.$parent.output(`${itemName} unequipped.`);
  });
  //return itemIds;
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
    this.$parent.output(`${item.displayName} already equipped.`);
    return;
  }

  this.unequipSlotsForItem(item, inventory);
  item.equipSlots.forEach(slot => this[slot] = item.id);
  this.$parent.output(`${item.displayName} equipped.`);
};

export default CharacterEquipSchema;
