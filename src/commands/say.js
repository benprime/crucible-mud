export default {
  name: 'say',

  patterns: [
    /^\.(.+)/, 
    /^say\s+(.+)/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1]);
  },

  execute(socket, message) {
    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // to sending socket
    socket.emit('output', { message: `You say "${safeMessage}"` });

    // everyone else
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} says "${safeMessage}"` });
  },

  help(socket) { 
    let output = '';
    output += '<span class="cyan">say command </span><span class="darkcyan">-</span> Speak to users in current room.<br>';
    output += '<span class="mediumOrchid">.<message></span> <span class="purple">-</span> Start a command with . to say to users.<br />';
    socket.emit('output', { message: output });
  },
};
