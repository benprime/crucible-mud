import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'unequip',
  desc: 'stop wielding or wearing an item your are currently using',
  category: commandCategories.item,

  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1], match[2]);
  },

  execute(character, itemName) {

    let item = autocomplete.inventory(character, itemName);
    if (!item) {
      character.output('You don\'t have that equipped.\n');
      return Promise.reject();
    }

    character.equipped.unequip(item);
    character.save(err => { if (err) throw err; });

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    character.output(output);
  },
};
