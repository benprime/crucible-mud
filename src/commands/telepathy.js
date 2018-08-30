import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';

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

    const targetCharacter = autocomplete.character(character, username);
    if (!targetCharacter) {
      return Promise.reject('Invalid username.');
    }

    return Promise.resolve({
      charMessages: [
        { charId: targetCharacter.id, message: `${character.name} telepaths: <span class="silver">${message}</span>` },
        { charId: character.id, message: `Telepath to ${targetCharacter.name}: <span class="silver">${message}</span>` },
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
