'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'take',

  alias: [],

  patterns: [
    /^take\s+(\w+)$/i,
    /^get\s+(\w+)$/i,
    /^take/i,
    /^get/i
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      socket.emit('output', { message: 'What do you want to take?' });
    }
    module.exports.execute(socket, match[1]);
  },

  execute(socket, itemName) {
    roomManager.getRoomById(socket.user.roomId, (room) => {

      // autocomplete name
      const itemNames = room.inventory.map(item => item.displayName);
      const resolvedNames = global.ResolveName(socket, itemName, itemNames);
      if(resolvedNames.length === 0) {
        socket.emit('output', { message: 'You don\'t see that item here.' });
        return;
      } else if(resolvedNames.length > 1) {
        // todo: possibly print out a list of the matches
        socket.emit('output', { message: 'Not specific enough!' });
        return;
      }

      const item = room.inventory.find(item => item.displayName === resolvedNames[0]);

      // todo: are we calling it 'fixed' for non-takeable items like signs and stuff?
      if (item.fixed) {
        socket.emit('output', { message: 'You cannot take that!' });
        return;
      }

      // take the item from the room
      const index = room.inventory.indexOf(item);
      room.inventory.splice(index, 1);
      room.save();

      // and give it to the user
      socket.user.inventory.push(item);
      socket.user.save();

      socket.emit('output', { message: 'Taken.' });
      socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} takes ${item.displayName}.` });
    });
  },

  help() { },
};
