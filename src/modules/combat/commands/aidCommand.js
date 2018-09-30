import autocomplete from '../../../core/autocomplete';

export default {
  name: 'aid',
  desc: 'Assist a player who has been incapacitated',

  patterns: [
    /^aid\s+(\w+)$/i,
    /^aid\s.+$/i,
    /^aid$/i,
  ],

  parseParams(match, character) {
    if(match.length < 2) return false;
    const targetPlayer = autocomplete.character(character, match[1]);
    return [this.name, targetPlayer];
  },

  help(character) {
    const output = '<span class="mediumOrchid">aid &lt;player&gt; </span><span class="purple">-</span> Bandage a player that recently been incapacitated.<br />';
    character.output(output);
  },
};
