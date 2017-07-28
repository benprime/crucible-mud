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
  desc: {
    type: String,
  },
  displayName: {
    type: String,
  },
  type: {
    type: String,
    enum: itemTypeEnum,
  },
  fixed: {
    type: Boolean,
  },

});

ItemSchema.methods.Look = function (socket) {
  socket.emit('output', { message: this.desc });
  if (socket.user.admin) {
    socket.emit('output', { message: `Item ID: ${this.id}` });
  }
};

module.exports = ItemSchema;
