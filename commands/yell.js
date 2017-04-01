'use strict';

const Room = require('../models/room');

module.exports = {
  name: 'yell',

  patterns: [
    /^'/,
    /^yell/i
  ],

  dispatch(socket, match) {},

  execute(socket, input) {
    socket.room.exits.forEach((door) => {
      let preMsg = '';
      if (door.dir === 'u') {
        preMsg = 'Someone yells from below ';
      } else if (door.dir === 'd') {
        preMsg = 'Someone yells from above ';
      } else {
        preMsg = `Someone yells from the ${Room.ExitName(Room.OppositeDirection(door.dir))} `;
      }

      var surroundMsg = `${preMsg} '${message}'`;

      socket.broadcast.to(door.roomId).emit('output', { message: surroundMsg });
    });


    socket.emit('output', { message: `You yell '${message}'` });
    socket.broadcast.to(socket.room._id).emit('output', { message: `You yell '${message}'` });
  },

  help() {},
}
