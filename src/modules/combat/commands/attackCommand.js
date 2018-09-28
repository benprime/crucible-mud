import commandCategories from '../../../core/commandCategories';
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'attack',
  desc: 'attack a monster',
  category: commandCategories.combat,

  patterns: [
    /^a\s+(.+)$/i,
    /^att\s+(.+)$/i,
    /^attack\s+(.+)$/i,
    /^attack$/i,
  ],

  parseParams(match, character) {
    if(match.length < 2) return false;
    const targetPlayer = autocomplete.mob(character, match[1]);
    return [this.name, targetPlayer];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">attack &lt;mob name&gt;<span class="purple">|</span> a</span> <span class="purple">-</span> Begin combat attacking &lt;target&gt;.<br />';
    character.output(output);
  },
};
