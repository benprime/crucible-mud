'use strict';

module.exports = {
  name: "who",

  patterns: [],

  dispatch(socket, match) {
  },

  execute(socket, input) {
    const usernames = [];

    /*
    Object.keys(global.io.sockets.sockets).forEach((socketId) => {
    // check if user logged in
    if (globals.USERNAMES[socketId]) {
    usernames.push(globals.USERNAMES[socketId]);
    }
    });
    let output = `<span class="cyan"> -=- ${usernames.length} Players Online -=-</span><br />`;
    output += `<div class="mediumOrchid">${usernames.join('<br />')}</div>`;
    socket.emit('output', { message: output });
    }
    */
  },

  help() {},
}
