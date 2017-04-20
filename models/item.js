'use strict';

/* State only model */
const ObjectId = require('mongodb').ObjectId;

function Item(itemType) {
  if(!this.id) {
    this.id = new ObjectId().toString();
  }
  return Object.assign(this, itemType);
}

Item.prototype.Look = function(socket) {
    socket.emit('output', { message: this.desc });
    if(socket.user.admin) {
      socket.emit('output', { message: `Item ID: ${this.id}` });
    }
};

module.exports = Item;
