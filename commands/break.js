'use strict';

module.exports = {
  name: 'break',

  patterns: [],

  dispatch(socket, match) {
    module.exports.execute(socket);
  },

  execute(socket) {
    if (socket.attackTarget) {
      socket.attackInterval = undefined;
      socket.lastAttack = undefined;
      socket.attackTarget = undefined;

      socket.broadcast.to(socket.room._id).emit('output', { message: `${socket.user.username} breaks off his attack.` });
      socket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    }
  },

  help() { },

};
