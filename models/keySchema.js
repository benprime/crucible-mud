'use strict';

const mongoose = require('mongoose');

const ItemType = {
  Item: "Item",
  Key: "Key",
};

const KeySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  desc: {
    type: String,
  },
  displayName: {
    type: String,
  },

});

module.exports = KeySchema;
