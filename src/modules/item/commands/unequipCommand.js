import autocomplete from '../../../core/autocomplete';
import commandCategories from '../../../core/commandCategories';

export default {
  name: 'unequip',
  desc: 'stop wielding or wearing an item your are currently using',
  category: commandCategories.item,

  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;
    const item = autocomplete.inventory(character, match[1]);
    return [this.name, item];
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    character.output(output);
  },
};
