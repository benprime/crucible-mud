import mongoose from 'mongoose';

const shopCache = {};

const ShopSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  stock: [{
    itemTypeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  }],
  owner: { String }, // this will be the NPC that owns the shop
}, { usePushEach: true });

ShopSchema.statics.shopCache = shopCache;

ShopSchema.statics.getById = roomId => {
  const shop = shopCache[roomId];
  return shop;
};

ShopSchema.statics.createShop = function (roomId, cb) {
  const shop = new this({ roomId: roomId });
  shop.save((err, shop) => {
    if (err) throw err;
    shopCache[roomId] = shop;
    cb(shop);
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

export default ShopSchema;
