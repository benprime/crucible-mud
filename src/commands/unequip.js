import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';

export default {
  name: 'unequip',

  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1], match[2])
      .then(output => socketUtil.output(socket, output))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, itemName) {

    let item = autocomplete.inventory(character, itemName);
    if (!item) {
      return Promise.reject('You don\'t have that equipped.\n');
    }

    character.unequip(item);
    character.save(err => { if (err) throw err; });

    return Promise.resolve();
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    socket.emit('output', { message: output });
  },
};
