'use strict';

const roomManager = require('../roomManager');

/*
    CreateItem(socket, item, callback) {
      // add to player's inventoryin mongo
      globals.DB.collection('users').update({ _id: socket.userId }, { $addToSet: { inventory: item } }, () => {
        // add item to player's current inventory
        socket.inventory.push(item);
        if (callback) callback();
      });
    },

function CreateItem(socket, name, callback) {
  const item = {
    _id: new ObjectId(),
    name,
    desc: 'Default description.',
  };

  items.CreateItem(socket, item, () => {
    socket.emit('output', { message: 'Item added to inventory.' });
    socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} has created a ${name} out of thin air.` });
    if (callback) callback();
  });
}

*/

module.exports = {
  name: "create",

  patterns: [
    '^create\s+(room)\s+(\w+)$',
    '^create\s+(item)\s+(.+)$',
  ],

  dispatch(socket, match) {
    roomManager.getRoomById(socket.user.roomId, (room) => {

    });
  },

  execute(socket, input) {
  },

  help() {},

}
