
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'uninvite',
  desc: 'Party leader command for removing a player from a party',


  patterns: [
    /^uninvite\s+(\w+)$/i,
    /^uninvite$/i,
  ],

  parseParams(match) {
    const targetCharacter = autocomplete.character(match[1]);
    return [this.name, targetCharacter];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">uninvite &lt;player&gt;</span> <span class="purple">-</span> Remove player from a party that you are leading.<br />';
    character.output(output);
  },
};
