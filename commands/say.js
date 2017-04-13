'use strict';

module.exports = {
  name: 'say',

  patterns: [/^\.(.+)/, /^say\s+(.+)/i],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // to sending socket
    socket.emit('output', { message: `You say "${safeMessage}"` });

    // everyone else
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} says "${safeMessage}"` });
  },

  help() { },
};
