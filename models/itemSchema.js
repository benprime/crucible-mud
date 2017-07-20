'use strict';

const mongoose = require('mongoose');

const itemTypeEnum = [
  "item",
  "key",
];

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  fixed: {
    type: Boolean
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
  }
});

ItemSchema.methods.Look = function (socket) {
    socket.emit('output', { message: this.desc });
    if(socket.user.admin) {
      socket.emit('output', { message: `Item ID: ${this.id}` });
    }
};

module.exports = ItemSchema;
