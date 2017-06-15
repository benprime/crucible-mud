'use strict';
const mongoose = require('mongoose');
const ItemSchema = require('./itemSchema');

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
