'use strict';

module.exports = {
  // returns first item that matches name
  CreateItem(socket, item, callback) {
    // add to player's inventoryin mongo
    global.DB.collection('users').update({ _id: socket.userId }, { $addToSet: { inventory: item } }, () => {
      // add item to player's current inventory
      socket.inventory.push(item);
      if (callback) callback();
    });
  },


  SetItem(socket, itemName, property, value) {
    if (!socket.admin) return;

    const item = socket.inventory.GetFirstByName(itemName) || socket.room.inventory.GetFirstByName(itemName);
    if (!item) {
      socket.emit('output', { message: "You don't see that anywhere!" });
      return;
    }

    // todo: finish this method and save to the database
    item.property = value;
  },
};
