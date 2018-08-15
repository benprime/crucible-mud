import socketUtil from '../core/socketUtil';

export default {
  name: 'party',

  patterns: [
    /^party$/i,
    /^par$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {
    const leaderSocketId = socket.leader ? socket.leader : socket.id;
    const followers = socketUtil.getFollowingSockets(leaderSocketId);
    if (followers.length === 0) {
      socket.emit('output', { message: 'You are not in a party.' });
      return;
    }

    if(leaderSocketId == socket.id) {
      followers.push(socket);
    } else {
      let leaderSocket = socketUtil.getSocket(leaderSocketId);
      followers.push(leaderSocket);
    }

    let output = 'The following people are in your party:\n';
    followers.forEach(follower => {
      output += `${follower.user.username}`;
      if (follower.id === leaderSocketId) {
        output += ' (Leader)';
      }
      output += '\n';
    });
    socket.emit('output', { message: output });

  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">party</span> <span class="purple">-</span> Display list of party members.<br />';
    socket.emit('output', { message: output });
  },
};
