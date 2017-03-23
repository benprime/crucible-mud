'use strict';

module.exports = {
  name: "say",

  patterns: [/^./, /^say/i],

  dispatch(socket, match) {
  },

  execute(socket, input) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // to sending socket
    socket.emit('output', { message: `You say "${safeMessage}"` });

    // everyone else
    socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} says "${safeMessage}"` });
  },

  help() {},
}
