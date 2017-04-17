'use strict';

module.exports = {
  name: 'inventory',

  patterns: [
    /^i$/i,
    /^inv$/i,
    /^inventory$/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket);
  },

  execute(socket) {
    const inv = socket.user.inventory || [];
    let invOutput = inv.map(item => item.displayName).join(', ');
    if (!invOutput) {
      invOutput = 'Nothing.';
    }

    let output = '<span class=\'cyan\'>You are carrying: </span>';
    output += '<span class=\'silver\'>';
    output += invOutput;
    output += '</span>';
    socket.emit('output', { message: output });
  },

  help() {},
};
