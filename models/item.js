'use strict';

/* State only model */
const ObjectId = require('mongodb').ObjectId;

function Item(itemType) {
  this.id = new ObjectId().toString();
  return Object.assign(this, itemType);
}

module.exports = Item;
