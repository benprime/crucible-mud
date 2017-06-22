'use strict';

const breakCmd = require('./break');
const lookCmd = require('./look');
const roomManager = require('../roomManager');

module.exports = {
  name: 'teleport',
  admin: true,

  patterns: [
    /^teleport\s+(\w+)$/i,
    /^tele\s+(\w+)$/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, teleportTo) {
    // if the parameter is an object id, we are teleporting to a room.
    const objectIdCheck = /^[0-9a-fA-F]{24}$/;
    let toRoomId = '';
    if (objectIdCheck.test(teleportTo)) {
      toRoomId = teleportTo;
    } else {
      // otherwise, we are teleporting to a user
      const userSocket = global.GetSocketByUsername(teleportTo);
      if (!userSocket) {
        socket.emit('output', { message: 'Player not found.' });
        return;
      }
      toRoomId = userSocket.user.roomId;
    }

    const room = roomManager.getRoomById(toRoomId);
    if (!room) {
      socket.emit('output', { message: 'Room not found.' });
      return;
    }
    breakCmd.execute(socket);

    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} vanishes!` });
    socket.leave(socket.user.roomId);
    socket.join(room.id);
    socket.user.roomId = room.id;
    socket.user.save();

    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} appears out of thin air!` });
    lookCmd.execute(socket);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">teleport &lt;room ID&gt;</span><span class="purple">-</span> Teleport to &lt;room&gt;.<br />';
    output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><span class="purple">-</span> Teleport to &lt;player&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
