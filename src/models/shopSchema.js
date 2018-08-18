import mongoose from 'mongoose';
import ItemSchema from './item';

const ShopSchema = new mongoose.Schema({
  inventory: {
    type: ItemSchema,
  },
  desc: {
    type: String,
  },
  owner: {
    // the npc that owns the shop?
    type: String,
  },
});

ItemSchema.methods.look = function (socket) {
  let output = this.desc;
  if(socket.user.admin) {
    output += `\nItem ID: ${this.id}`;
  }
  socket.emit('output', { message: output });
};

export default ItemSchema;
