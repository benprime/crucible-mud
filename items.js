'use strict';

module.exports = {
  // returns first item that matches name

  DestroyItem(socket, itemName) {
    const item = socket.inventory.GetFirstByName(itemName);
    if (!item) {
      socket.emit('output', { message: `You don't seem to have a ${itemName}.` });
      return;
    }

    // remove from user in mongo
    global.db.collection('users').update({ _id: socket.userId }, { $pull: { inventory: { _id: item._id } } }, () => {
      // TODO: does this delete from existence by id?
    });

    // remove from player's current inventory
    socket.inventory = socket.inventory.filter(obj =>
      // todo: check if this toString was necessary.
      obj._id.toString() !== item._id.toString());
  },
};
