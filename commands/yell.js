'use strict';

const Room = require('../models/room');

module.exports = {
  name: 'yell',

  patterns: [
    /^"(.+)"?/,
    /^yell\s+(.+)/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, message) {

    const room = Room.getById(socket.user.roomId);

    room.exits.forEach((exit) => {
      let preMsg = '';
      if (exit.dir === 'u') {
        preMsg = 'Someone yells from below ';
      } else if (exit.dir === 'd') {
        preMsg = 'Someone yells from above ';
      } else {
        preMsg = `Someone yells from the ${Room.shortToLong(Room.oppositeDirection(exit.dir))} `;
      }
      var surroundMsg = `${preMsg} '${message}'`;
      socket.broadcast.to(exit.roomId).emit('output', { message: surroundMsg });
    });

    socket.emit('output', { message: `You yell '${message}'` });
    socket.broadcast.to(room.id).emit('output', { message: `You yell "${message}"` });
  },

  help(socket) {
    let output = '';
    output += '<span class="cyan">yell command</span><br/>';
    output += '<span class="mediumOrchid">"<message></span> <span class="purple">-</span> Yell to this room and all adjacent rooms.<br />';
    socket.emit('output', { message: output });
  },
};
