'use strict';

module.exports = {
  name: 'break',

  patterns: [
    /br$/i,
    /break$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket);
  },

  execute(socket) {
    if (socket.user.attackTarget) {
      socket.user.attackInterval = undefined;
      socket.user.lastAttack = undefined;
      socket.user.attackTarget = undefined;

      socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} breaks off his attack.` });
      socket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    } else {
      socket.emit('output', { message: 'You are not currently in combat.' });
    }
  },

  help(socket) { 
    let output = '';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> End combat.<br />';
    socket.emit('output', { message: output });
  },

};
