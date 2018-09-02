import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

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
      return this.help(socket.character);
    }
    return this.execute(socket.character, match[1], match[2])
      .catch(error => socket.character.output(error));
  },

  execute(character, username, message) {

    let safeMessage = message.replace(/</g, '&lt;');
    safeMessage = safeMessage.replace(/>/g, '&gt;');

    // party chat
    if (username.toLowerCase() === 'par' || username.toLowerCase() === 'party') {
      return character.toParty(`<span class="olive">[Party Chat]</span> ${character.name}: <span class="silver">${safeMessage}</span>`);
    }

    // player to player chat
    const targetCharacter = autocomplete.character(character, username);
    if (!targetCharacter) {
      return Promise.reject('Invalid username.');
    }

    targetCharacter.output(`${character.name} telepaths: <span class="silver">${safeMessage}</span>`);
    character.output(`Telepath to ${targetCharacter.name}: <span class="silver">${safeMessage}</span>`);

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="cyan">telepathy command</span><br/>';
    output += '<span class="mediumOrchid">&#x2F;<message></span> <span class="purple">-</span> Send message directly to a single player.<br />';
    character.output(output);
  },
};
