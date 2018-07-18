'use strict';

const socketUtil = require('../core/socketUtil');

module.exports = {
  name: 'invite',

  patterns: [
    /^invite\s+(\w+)$/i,
    /^invite\s*.*$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      module.exports.help(socket);
      return;
    }
    module.exports.execute(socket, match[1]);
  },

  execute(socket, username) {
    const targetSocket = socketUtil.validUserInRoom(socket, username);
    if (!targetSocket) {
      return;
    }

    if (!targetSocket.partyInvites) {
      targetSocket.partyInvites = [];
    }

    if (!targetSocket.partyInvites.includes(socket.user.id)) {
      targetSocket.partyInvites.push(socket.user.id);
    }

    targetSocket.emit('output', { message: `${socket.user.username} has invited you to join a party.` });
    socket.emit('output', { message: `You have invited ${targetSocket.user.username} to join your party.` });

    // TODO: make party invites timeout
    // setTimeout(() => {
    //   let itemIndex = toUserSocket.offers.findIndex(o => o.item.id === item.id);
    //   if (itemIndex !== -1) {
    //     toUserSocket.offers.splice(itemIndex, 1);
    //   }
    //   if (cb) cb();
    // }, 60000);
  },

  help(socket) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
