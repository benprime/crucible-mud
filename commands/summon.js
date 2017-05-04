'use strict';

const breakCmd = require('./break');
const lookCmd = require('./look');

module.exports = {
  name: 'summon',
  admin: true,

  patterns: [
    /summon\s+(\w+)$/i,
    /sum\s+(\w+)$/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, username) {
    const userSocket = global.GetSocketByUsername(username);

    //verify summoned player
    if (!userSocket) {
      socket.emit('output', { message: 'Player not found.' });
      return;
    }

    //remove summoned player from combat
    breakCmd.execute(userSocket);

    //move summoned player to summoner's room
    userSocket.leave(userSocket.user.roomId);
    userSocket.join(socket.user.roomId);
    userSocket.user.roomId = socket.user.roomId;
    userSocket.user.save();

    //announce summoned player's arrival
    userSocket.emit('output', { message: `You were summoned to ${socket.user.username}'s room!` });
    userSocket.broadcast.to(userSocket.user.roomId).emit('output', { message: `${userSocket.user.username} appears out of thin air!` });
    
    //display room info to summoned player
    lookCmd.execute(userSocket);
  },

  help(socket) { 
    let output = '';
    output += '<span class="mediumOrchid">summon &lt;username&gt; </span><span class="purple">-</span> Summon &lt;player&gt; to current room.<br />';
    socket.emit('output', { message: output });
  },
};
