import autocomplete from '../../../core/autocomplete';
import commandCategories from '../../../core/commandCategories';

export default {
  name: 'accept',
  desc: 'accept offered currency or item from another player',
  category: commandCategories.item,

  patterns: [
    /^accept\s+offer\s+(\w+)$/i,
    /^accept\s.*$/i,
    /^accept$/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;
    const fromCharacter = autocomplete.character(character, match[1]);
    return [this.name, fromCharacter];
  },

  help(character) {
    const output = '<span class="mediumOrchid">accept offer &lt;player&gt; </span><span class="purple">-</span> Accept an offer from another player.<br />';
    character.output(output);
  },
};
