import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import { commandCategories } from '../core/commandManager';

export default {
  name: 'telepathy',
  desc: 'communicate directly to a single user',
  category: commandCategories.system,

  patterns: [
    /^\/(\w+)\s+(.*)$/,
    /^\/.*$/,
    /^telepathy\s+(\w+)\s+(.*)$/,
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

    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // party chat
    if(username.toLowerCase() === 'par'|| username.toLowerCase() === 'party') {
      return character.toParty(`<span class="olive">[Party Chat]</span> ${character.name}: <span class="silver">${safeMessage}</span>`);
    }

    // player to player chat
    const targetCharacter = autocomplete.character(character, username);
    if (!targetCharacter) {
      return Promise.reject('Invalid username.');
    }

    return Promise.resolve({
      charMessages: [
        { charId: targetCharacter.id, message: `${character.name} telepaths: <span class="silver">${safeMessage}</span>` },
        { charId: character.id, message: `Telepath to ${targetCharacter.name}: <span class="silver">${safeMessage}</span>` },
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
