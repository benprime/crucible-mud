import autocomplete from '../core/autocomplete';

export default {
  name: 'uninvite',
  desc: 'Attempt to track another player',

  patterns: [
    /^track\s+(\w+)$/i,
    /^track$/i,
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
      return Promise.reject(`${targetChar.name} is not in your party.`);
    }

    targetChar.leader = undefined;
    //targetChar.output(`<span class="yellow">You have been removed from ${character.name}'s party.`);
    targetChar.toParty(`<span class="yellow">${targetChar} has been removed from ${character.name}'s party.`);
    return Promise.resolve();
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">uninvite &lt;player&gt;</span> <span class="purple">-</span> Remove player from a party that you are leading.<br />';
    socket.emit('output', { message: output });
  },
};
