'use strict';

const Room = require('../models/room');

module.exports = {
  name: 'open',

  patterns: [
    /^open\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, dir) {
    const d = Room.ValidDirectionInput(dir.toLowerCase());
    const room = Room.getRoomById(socket.user.roomId);

    // valid exit in that direction?
    const exit = room.exits.find(e => e.dir === d);
    if (!exit) {
      socket.emit('output', { message: 'There is no exit in that direction!' });
      return;
    }

    if (!exit.hasOwnProperty('closed')) {
      socket.emit('output', { message: 'There is no door in that direction!' });
      return;
    }

    if (exit.locked) {
      socket.emit('output', { message: 'That door is locked.' });
      return;
    }

    if (!exit.closed) {
      socket.emit('output', { message: 'That door is already open.' });
      return;
    }

    exit.closed = false;
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} opens the door to the ${Room.exitName(d)}.` });
    socket.emit('output', { message: 'Door opened.' });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">open &lt;direction&gt; </span><span class="purple">-</span> Open a door in the given direction.<br />';
    socket.emit('output', { message: output });
  },
};
