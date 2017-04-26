'use strict';

module.exports = {
  name: 'experience',

  patterns: [
    /^exp$/i,
    /^xp$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket);
  },

  execute(socket) {
    let output = '<span class=\'cyan\'>XP: </span>';
    output += `<span class=\'silver\'>${socket.user.xp}</span>\n`;
    output += '<span class=\'cyan\'>Level: </span>';
    output += `<span class=\'silver\'>${socket.user.level}</span>\n`;
    output += '<span class=\'cyan\'>Next: </span>';
    output += `<span class=\'silver\'>${socket.user.nextExp()}</span>\n`;
    socket.emit('output', { message: output });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">inventory </span><span class="purple">-</span> Shows current user experience points.<br />';
    socket.emit('output', { message: output });
  },
};
