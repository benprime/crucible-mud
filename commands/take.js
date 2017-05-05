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
      const completedNames = global.AutocompleteName(socket, itemName, itemNames);
      if (completedNames.length === 0) {
        socket.emit('output', { message: 'You don\'t see that item here.' });
        return;
      } else if (completedNames.length > 1) {
        // todo: possibly print out a list of the matches
        socket.emit('output', { message: 'Not specific enough!' });
        return;
      }

      const item = room.inventory.find(item => item.displayName === completedNames[0]);

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

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    socket.emit('output', { message: output });
  },
};
