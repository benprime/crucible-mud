export default {
  name: 'break',

  patterns: [
    /^br$/i,
    /^break$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {
    if (socket.character.attackTarget) {
      socket.character.attackInterval = undefined;
      socket.character.lastAttack = undefined;
      socket.character.attackTarget = undefined;

      socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} breaks off his attack.` });
      socket.emit('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">break <span class="purple">|</span> br</span> <span class="purple">-</span> End combat.<br />';
    socket.emit('output', { message: output });
  },

};
