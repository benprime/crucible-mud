'use strict';

module.exports = {
  name: 'who',

  patterns: [
    /^who$/i
  ],

  dispatch(socket) {
    module.exports.execute(socket);
  },

  execute(socket) {
    const usernames = [];

    Object.keys(global.io.sockets.sockets).forEach((socketId) => {
      let socket = global.io.sockets.sockets[socketId];
      // check if user logged in
      if (socket.user) {
        usernames.push(socket.user.username);
      }
    });
    let output = `<span class='cyan'> -=- ${usernames.length} Players Online -=-</span><br />`;
    output += `<div class='mediumOrchid'>${usernames.join('<br />')}</div>`;
    socket.emit('output', { message: output });
  },

  help() {},
};
