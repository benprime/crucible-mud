'use strict';

const socketUtil = require('../core/socketUtil');
const utils = require('../core/utilities');

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
    const invitingSocket = socketUtil.validUserInRoom(socket, username);
    if (!invitingSocket) {
      return;
    }

    if (!Array.isArray(socket.partyInvites) || !socket.partyInvites.includes(invitingSocket.user.id)) {
      socket.emit('output', { message: 'You must be invited.' });
      return;
    }

    socket.leader = invitingSocket.id;
    utils.removeItem(socket.partyInvites, invitingSocket.user.id);

    socket.emit('output', { message: `You are now following ${username}.` });
    invitingSocket.emit('output', { message: `${socket.user.username} has started following you.` });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
