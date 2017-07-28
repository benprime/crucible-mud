'use strict';

const roomManager = require('../roomManager');
const autocomplete = require('../autocomplete');

module.exports = {
  name: 'drop',

  patterns: [
    /^dr\s+(.+)$/i,
    /^drop\s+(.+)$/i,
    /^drop/i,
  ],

  dispatch(socket, match) {
    console.log(match);
    if (match.length < 2) {
      socket.emit('output', { message: 'What do you want to drop?' });
      return;
    }
    module.exports.execute(socket, match[1]);
  },

  execute(socket, itemName) {
    const room = roomManager.getRoomById(socket.user.roomId);

    const item = autocomplete.autocomplete(socket, room, ['inventory', 'key'], itemName);
    if (!item) {
      socket.emit('output', { message: 'You don\'t seem to be carrying that!' });
      return;
    }

    // remove item from users inventory or key ring
    if (item.type === 'item') {
      socket.user.inventory.remove(item);
    } else if (item.type === 'key') {
      socket.user.keys.remove(item);
    }
    socket.user.save();

    // and place it in the room
    room.inventory.push(item);
    room.save();

    socket.emit('output', { message: 'Dropped.' });
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} drops ${item.name}.` });

  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">drop &lt;item name&gt </span><span class="purple">-</span> Drop <item> from inventory onto the floor.<br>';
    socket.emit('output', { message: output });
  },

};
