import autocomplete from '../../../core/autocomplete';
import socketUtil from '../../../core/socketUtil';

export default {
  name: 'drop',
  desc: 'drop an inventory item on the ground',

  patterns: [
    /^dr\s+(.+)$/i,
    /^drop\s+(.+)$/i,
    /^drop/i,
    /^dr$/i,
  ],

  parseParams(match, character) {
    if (match.length < 2) return false;

    // check for dragging player
    let item;
    if (character.dragging) {
      item = socketUtil.getCharacterById(character.dragging);
    } else {
      const acResult = autocomplete.multiple(character, ['inventory', 'key'], match[1]);
      item = acResult ? acResult.item : null;
    }
    return {actionName: this.name, actionParams: [item]};
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">drop &lt;item name&gt </span><span class="purple">-</span> Drop <item> from inventory onto the floor.<br>';
    character.output(output);
  },

};
