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
  socket.emit('output', { message: this.desc });
  if (socket.user.admin) {
    socket.emit('output', { message: `Item ID: ${this.id}` });
  }
};

module.exports = ItemSchema;
