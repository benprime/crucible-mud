'use strict';

const Room = require('../models/room');
const roomManager = require('../roomManager');

module.exports = {
  name: 'yell',

  patterns: [
    /^"(.+)"?/,
    /^yell\s+(.+)/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, message) {

    roomManager.getRoomById(socket.user.roomId, (room) => {


      room.exits.forEach((door) => {
        let preMsg = '';
        if (door.dir === 'u') {
          preMsg = 'Someone yells from below ';
        } else if (door.dir === 'd') {
          preMsg = 'Someone yells from above ';
        } else {
          preMsg = `Someone yells from the ${Room.exitName(Room.oppositeDirection(door.dir))} `;
        }

        var surroundMsg = `${preMsg} '${message}'`;

        socket.broadcast.to(door.roomId).emit('output', { message: surroundMsg });
      });

      socket.emit('output', { message: `You yell '${message}'` });
      socket.broadcast.to(room.id).emit('output', { message: `You yell "${message}"` });
    });
  },

  help() {},
};
