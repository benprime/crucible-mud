import mongoose from 'mongoose';
import socketUtil from '../core/socketUtil';

const itemTypeEnum = [
  'item',
  'key',
];

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  displayName: {
    type: String,
  },
  desc: {
    type: String,
  },
  type: {
    type: String,
    enum: itemTypeEnum,
  },
  hidden: {
    type: Boolean,
  },
  range: {
    type: String,
  },
  fixed: {
    type: Boolean,
  },
  equip: [{ type: String }],
  damage: {
    type: String,
  },
  damageType: {
    type: String,
  },
  speed: {
    type: String,
  },
  bonus: {
    type: String,
  },
});

ItemSchema.methods.look = function (character) {
  const socket = socketUtil.getSocketByCharacterId(character.id);
  let output = this.desc;
  if (socket.user.debug) {
    output += `\nItem ID: ${this.id}`;
  }
  return Promise.resolve(output);
};

export default ItemSchema;
