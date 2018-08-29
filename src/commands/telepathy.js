import socketUtil from '../core/socketUtil';

export default {
  name: 'telepathy',
  desc: 'communicate directly to a single user',

  patterns: [
    /^\/(\w+)\s+(.*)$/,
    /^\/.*$/,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      this.help(socket);
      return;
    }
    this.execute(socket.character, match[1], match[2])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, username, message) {
    const userSocket = socketUtil.getSocketByCharacterId(username);
    if (!userSocket) {
      return Promise.reject('Invalid username.');
    }
    username = userSocket.character.name;
    const sender = character.name;

    return Promise.resolve({
      charMessages: [
        { charId: userSocket.character.id, message: `${sender} telepaths: ${message}` },
        { charId: character.id, message: `Telepath to ${username}: ${message}` },
      ],
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="cyan">telepathy command</span><br/>';
    output += '<span class="mediumOrchid">&#x2F;<message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    socket.emit('output', { message: output });
  },
};
