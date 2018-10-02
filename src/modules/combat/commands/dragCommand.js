import autocomplete from '../../../core/autocomplete';

export default {
  name: 'drag',
  desc: 'Drag a player who is incapacitated',

  patterns: [
    /^drag\s+(\w+)$/i,
    /^drag\s.+$/i,
    /^drag$/i,
  ],

  parseParams(match, character) {
    if(match.length < 2) return false;
    const targetPlayer = autocomplete.character(character, match[1]);
    return [this.name, targetPlayer];
  },

  help(character) {
    const output = '<span class="mediumOrchid">drag &lt;player&gt; </span><span class="purple">-</span> Drag a player who is incapacitated.<br />';
    character.output(output);
  },
};
