'use strict';

const Room = require('../models/room');
const socketUtil = require('../core/socketUtil');

module.exports = {
  name: 'follow',

  patterns: [
    /^follow\s+(\w+)$/i,
    /^follow\s*.*$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, username) {
    const targetSocket = socketUtil.getSocketByUsername(username);
    if(!targetSocket) {
      socket.emit('output', {message: 'Unknown player'});
      return;
    }

    if(Array.isArray(targetSocket.partyInvites) && targetSocket.partyInvites.includes(targetSocket.user.id))
    {
      socket.emit('output', {message: 'You must be invited.'});
      return;
    }

    const room = Room.getById(socket.user.roomId);
    if(!room.userInRoom(username)) {
      socket.emit('output', {message: `You don't see ${username} here.`});
      return;
    }

    socket.leader = targetSocket.id;
    socket.remove(targetSocket.id);
    socket.emit('output', {message: `You are now following ${username}.`});
    targetSocket.emit('output', {message: `${socket.user.username} has started following you.`});
  },

  help(socket) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
