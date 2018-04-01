'use strict';

const Room = require('../models/room');
const autocomplete = require('../autocomplete');

module.exports = {
  name: 'attack',

  patterns: [
    /^a\s+(.+)$/i,
    /^attack\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, targetName) {
    const room = Room.getById(socket.user.roomId);
    const target = autocomplete.autocompleteTypes(socket, ['mob'], targetName);
    if (!target) {
      socket.user.attackTarget = null;
      return;
    }

    socket.user.attackTarget = target.item.id;
    socket.user.attackInterval = 4000;

    socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
    socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} moves to attack ${target.displayName}!` });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">attack &lt;mob name&gt;<span class="purple">|</span> a</span> <span class="purple">-</span> Begin combat attacking &lt;target&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
