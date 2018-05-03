'use strict';

const mongoose = require('mongoose');

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
  equip: {
    type: String,
  },
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

ItemSchema.methods.look = function (socket) {
  let output = this.desc;
  if(socket.user.admin) {
    output += `\nItem ID: ${this.id}`;
  }
  socket.emit('output', { message: output });
};

module.exports = ItemSchema;
