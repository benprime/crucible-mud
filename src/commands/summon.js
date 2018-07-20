const breakCmd = require('./break');
const socketUtil = require('../core/socketUtil');
const lookCmd = require('./look');

module.exports = {
  name: 'summon',
  admin: true,

  patterns: [
    /^summon\s+(\w+)$/i,
    /^sum\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, username) {
    const targetUserSocket = socketUtil.getSocketByUsername(username);

    //verify summoned player
    if (!targetUserSocket) {
      socket.emit('output', { message: 'Player not found.' });
      return;
    }

    //remove summoned player from combat
    breakCmd.execute(targetUserSocket);

    //move summoned player to summoner's room
    targetUserSocket.leave(targetUserSocket.user.roomId);
    targetUserSocket.join(socket.user.roomId);
    targetUserSocket.user.roomId = socket.user.roomId;
    targetUserSocket.user.save();

    //announce summoned player's arrival
    targetUserSocket.emit('output', { message: `You were summoned to ${socket.user.username}'s room!` });
    targetUserSocket.broadcast.to(targetUserSocket.user.roomId).emit('output', { message: `${targetUserSocket.user.username} appears out of thin air!` });

    //display room info to summoned player
    lookCmd.execute(targetUserSocket);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">summon &lt;username&gt; </span><span class="purple">-</span> Summon &lt;player&gt; to current room.<br />';
    socket.emit('output', { message: output });
  },
};
