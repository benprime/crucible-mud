import socketUtil from '../core/socketUtil';

export default {
  name: 'invite',

  patterns: [
    /^invite\s+(\w+)$/i,
    /^invite\s.+$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      this.help(socket);
      return;
    }
    this.execute(socket, match[1]);
  },

  execute(socket, username) {

    if (socket.leader) {
      socket.emit('output', { message: 'Only the party leader may invite followers.' });
      return;
    }

    const targetSocket = socketUtil.characterInRoom(socket, username);
    if (!targetSocket) {
      return;
    }

    if (!targetSocket.character.partyInvites) {
      targetSocket.character.partyInvites = [];
    }

    if (!targetSocket.character.partyInvites.includes(socket.character.id)) {
      targetSocket.character.partyInvites.push(socket.character.id);
    }

    targetSocket.emit('output', { message: `${socket.user.username} has invited you to join a party.` });
    socket.emit('output', { message: `You have invited ${targetSocket.user.username} to join your party.` });

    // TODO: make party invites timeout
    // setTimeout(() => {
    //   let itemIndex = toUserSocket.character.offers.findIndex(o => o.item.id === item.id);
    //   if (itemIndex !== -1) {
    //     toUserSocket.character.offers.splice(itemIndex, 1);
    //   }
    //   if (cb) cb();
    // }, 60000);
  },

  help(socket) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
