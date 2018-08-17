import socketUtil from '../core/socketUtil';
import utils from '../core/utilities';

export default {
  name: 'follow',

  patterns: [
    /^follow\s+(\w+)$/i,
    /^follow\s.+$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1]);
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

    socket.leader = invitingSocket.user.id;

    // re-assign following sockets to new leader
    let followingSockets = socketUtil.getFollowingSockets(socket.user.id);
    followingSockets.forEach(s => {
      s.leader = invitingSocket.user.id;
      s.emit('output', { message: `<span class="yellow">Now following ${invitingSocket.user.username}</span>` });
    });

    utils.removeItem(socket.partyInvites, invitingSocket.user.id);

    socket.emit('output', { message: `You are now following ${username}.` });
    invitingSocket.emit('output', { message: `${socket.user.username} has started following you.` });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">invite &lt;player&gt; </span><span class="purple">-</span> Invite a player to follow you.<br />';
    socket.emit('output', { message: output });
  },
};
