import autocomplete from '../../../core/autocomplete';


export default {
  name: 'unequip',
  desc: 'stop wielding or wearing an item your are currently using',


  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;
    const item = autocomplete.equippedItems(character, match[1]);
    return {actionName: this.name, actionParams: [item]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    character.output(output);
  },
};
