'use strict';

module.exports = {
  name: 'set',

  patterns: [],

  dispatch(socket, match) {
  },

  execute(socket, input) {
    const roomPropertyWhiteList = ['name', 'desc'];
    if (roomPropertyWhiteList.indexOf(property) === -1) {
      socket.emit('output', { message: 'Invalid property.' });
      return;
    }

    // replace all instances of multiple spaces with a single space
    let value = commandString.replace(/\s+/g, ' ').trim();
    value = value.replace(`set room ${property} `, '');

    rooms.UpdateRoom(global.io, socket.room._id, property, value, () => {
      socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} has altered the fabric of reality.` });
      lookCallback();
    });
  },

  help() {},
}
