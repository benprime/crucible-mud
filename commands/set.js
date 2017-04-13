'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'set',

  patterns: [
    /^set\s+(room)\s+(desc)\s+(.+)$/i,
    /^set\s+(room)\s+(name)\s+(.+)$/i,
    /^set$/i,
  ],

  dispatch(socket, match) {

    // if we've matched on ^set, but the proper parameters
    // were not passed...
    if (match.length != 4) {
      // todo: print command help
      socket.emit('output', { message: 'Invalid command usage.' });
      return;
    }

    const type = match[1];
    const prop = match[2];
    const value = match[3];

    module.exports.execute(socket, type, prop, value);
  },

  execute(socket, type, prop, value) {

    //todo: break these out into seperate helper methods?
    if (type === 'room') {
      const roomPropertyWhiteList = ['name', 'desc'];
      if (roomPropertyWhiteList.indexOf(prop) === -1) {
        socket.emit('output', { message: 'Invalid property.' });
        return;
      }

      roomManager.getRoomById(socket.user.roomId, (room) => {
        room[prop] = value;
        room.save();
        socket.broadcast.to(socket.room._id).emit('output', { message: `${socket.user.username} has altered the fabric of reality.` });
        //todo: add look here
      });
    } else if (type === 'item') {

    }
  },

  help() { },
};
