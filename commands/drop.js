'use strict';

/*
    DropItem(socket, itemName, callback) {
      const item = socket.inventory.GetFirstByName(itemName);
      if (!item) {
        socket.emit('output', { message: `You don't seem to have a ${itemName}.` });
        return;
      }
      // remove from user in mongo
      globals.DB.collection('users').update({ _id: socket.userId }, { $pull: { inventory: { _id: item._id } } }, () => {
        // add to room
        globals.DB.collection('rooms').update({ _id: socket.room._id }, { $addToSet: { inventory: item } }, () => {
          // refresh the room for all players currently joined to it
          rooms.RefreshRoom(io, socket.room._id, () => {
            socket.emit('output', { message: 'Item dropped.' });
            socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} drops ${item.name}.` });
            if (callback) callback();
          });
        });
      });

      // remove from player's current inventory
      socket.inventory = socket.inventory.filter(obj =>
        // todo: check if this toString was necessary.
         obj._id.toString() !== item._id.toString());
    },
*/

module.exports = {
  name: 'drop',

  patterns: [],

  dispatch(socket, match) {
  },

  execute(socket, input) {
  },

  help() {},

}
