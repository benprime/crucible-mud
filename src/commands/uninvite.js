import autocomplete from '../core/autocomplete';

export default {
  name: 'uninvite',
  desc: 'Party leader command for removing a player from a party',

  patterns: [
    /^uninvite\s+(\w+)$/i,
    /^uninvite$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      return this.help(socket);
    }

    this.execute(socket.character, match[1])
      .then(output => socket.character.output(output))
      .catch(output => socket.character.output(output));
  },

  execute(character, name) {

    const targetChar = autocomplete.character(character, name);
    if (!targetChar) {
      return Promise.reject('Unknown player.');
    }

    if (targetChar.leader !== character.id) {
      return Promise.reject(`You are not leading ${targetChar.name} in a party.`);
    }

    const partyMsg = `<span class="yellow">${targetChar.name} has been removed from ${character.name}'s party.\n`;
    targetChar.toParty(partyMsg);
    targetChar.leader = undefined;
    return Promise.resolve();
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">uninvite &lt;player&gt;</span> <span class="purple">-</span> Remove player from a party that you are leading.<br />';
    socket.emit('output', { message: output });
  },
};
