import mongoose from 'mongoose';
import autocomplete from '../core/autocomplete';
import itemData from '../data/itemData';

// TODO: Move this dependency into a shared module in core
import { spawnAndGive } from '../modules/admin/actions/spawnAction';

const shopCache = {};

const ShopSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  stock: [{
    itemTypeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  }],
  currency: { type: Number, min: 0, default: 0 },
  owner: { String }, // this will be the NPC that owns the shop
}, { usePushEach: true });

ShopSchema.statics.shopCache = shopCache;

ShopSchema.statics.getById = roomId => {
  const shop = shopCache[roomId];
  return shop;
};

ShopSchema.statics.createShop = function (roomId) {
  const shop = new this({ roomId: roomId });
  return shop.save((err, shop) => {
    if (err) throw err;
    shopCache[roomId] = shop;
  });
};

ShopSchema.statics.populateShopCache = function () {
  this.find({}, (err, result) => {
    if (err) throw err;
    result.forEach(shop => {
      shopCache[shop.roomId] = shop;
    });
  });
};

ShopSchema.methods.getStockTypes = function () {
  return this.stock.map(s => {
    const itemType = itemData.catalog.find(
      item => item.name.toLowerCase() === s.itemTypeName.toLowerCase()
        && item.type === 'item');
    return Object.assign(s, { itemType: itemType });
  });
};

ShopSchema.methods.getItemTypeByAutocomplete = function (itemName) {
  const stockTypes = this.getStockTypes();
  const itemTypes = stockTypes.map(st => st.itemType);

  const acResult = autocomplete.byProperty(itemTypes, 'name', itemName);
  if (Array.isArray(acResult) && acResult.length > 1) {
    const names = acResult.map(i => i.name);
    return Promise.reject(`Which ${itemName} did you mean?\n` + names.join('\n'));
  }

  if (Array.isArray(acResult) && acResult.length === 1) {
    return Promise.resolve(acResult[0]);
  }

  if (Array.isArray(acResult) && acResult.length === 0) {
    return Promise.reject('This shop does not deal in those types of items.');
  }
};

ShopSchema.methods.buy = function (character, itemType) {

  const stockType = this.stock.find(st => st.itemTypeName === itemType.name);
  if (!stockType) {
    return;
  }

  // item is out of stock
  if (stockType.quantity === 0) {
    return;
  }

  // character doesn't have enough money
  if (character.currency < itemType.price) {
    return;
  }

  // update shop
  this.currency += itemType.price;
  stockType.quantity--;

  // update player
  character.currency -= itemType.price;

  this.save((err) => {
    if (err) throw err;
  });

  const item = spawnAndGive(character, itemType);

  return item;
};

ShopSchema.methods.getSellPrice = function (itemType) {
  return Math.round(itemType.price * 0.6);
};

ShopSchema.methods.sell = function (character, itemType) {

  // check if character is carrying the item
  const item = character.inventory.find(i => i.name === itemType.name);
  if (!item) {
    return;
  }

  // check if item can be sold
  if (!itemType.price) {
    return;
  }

  // check if shop carries this type of item
  const stockType = this.stock.find(st => st.itemTypeName === itemType.name);
  if (!stockType) {
    return;
  }

  const sellPrice = this.getSellPrice(itemType);

  // shop doesn't have enough money
  if (this.currency < sellPrice) {
    return;
  }

  // update shop
  this.currency -= sellPrice;
  stockType.quantity++;

  // update player
  character.currency += sellPrice;

  this.save((err) => {
    if (err) throw err;
  });

  character.inventory.id(item.id).remove();
  character.save(err => {
    if (err) throw err;
  });
};

export default ShopSchema;
