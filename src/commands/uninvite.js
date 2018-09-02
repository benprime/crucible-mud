import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'uninvite',
  desc: 'Party leader command for removing a player from a party',
  category: commandCategories.party,

  patterns: [
    /^uninvite\s+(\w+)$/i,
    /^uninvite$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      this.help(socket.character);
      return Promise.resolve();
    }

    return this.execute(socket.character, match[1]);
  },

  execute(character, name) {

    const targetChar = autocomplete.character(character, name);
    if (!targetChar) {
      character.output('Unknown player.');
      return Promise.reject();
    }

    if (targetChar.leader !== character.id) {
      character.output(`You are not leading ${targetChar.name} in a party.`);
      return Promise.reject();
    }

    const partyMsg = `<span class="yellow">${targetChar.name} has been removed from ${character.name}'s party.\n`;
    targetChar.toParty(partyMsg);
    targetChar.leader = undefined;
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">uninvite &lt;player&gt;</span> <span class="purple">-</span> Remove player from a party that you are leading.<br />';
    character.output(output);
  },
};
