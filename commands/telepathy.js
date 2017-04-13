'use strict';

module.exports = {
  name: 'telepathy',

  patterns: [/^\/(\w+)\s+(.*)$/],

  dispatch(socket, match) {
    // todo: add a pattern for just / anything, if the correct number of matches
    // isn't present, then print help and return.
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, username, message) {
    const userSocket = global.GetSocketByUsername(username);
    if (!userSocket) {
      socket.emit('output', { message: 'Invalid username.' });
      return;
    }
    username = userSocket.user.username; // just correcting the casing
    const sender = socket.user.username;

    userSocket.emit('output', { message: `${sender} telepaths: ${message}` });
    socket.emit('output', { message: `Telepath to ${username}: ${message}` });
  },

  help() { },
};
