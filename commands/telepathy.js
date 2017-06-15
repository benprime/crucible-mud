'use strict';

module.exports = {
  name: 'telepathy',

  patterns: [
    /^\/(\w+)\s+(.*)$/,
    /^\/.*$/,
  ],

  dispatch(socket, match) {
    if(match.length != 3) {
      module.exports.help(socket);
      return;
    }
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

  help(socket) {
    let output = '';
    output += '<span class="cyan">telepathy command</span><br/>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    socket.emit('output', { message: output });
  },
};
