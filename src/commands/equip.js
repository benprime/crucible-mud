import autocomplete from '../core/autocomplete';

export default {
  name: 'equip',
  desc: 'wield a weapon or wear armor you are currently carrying',

  patterns: [
    /^eq\s+(.+)$/i,
    /^equip\s+(.+)$/i,
    /^wield\s+(.+)$/i,
    /^equip$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1], match[2])
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, itemName) {

    const acResult = autocomplete.multiple(character, ['inventory'], itemName);
    if (!acResult) {
      return Promise.reject('item is not in inventory.');
    }

    const item = acResult.item;

    // check if item is equipable or return
    if (!item.equipSlots || item.equipSlots.length === 0) {
      return Promise.reject('You cannot equip that!\n');
    }

    character.equipped.equip(item);
    character.save(err => { if (err) throw err; });

    return Promise.resolve(); // output taken care of in character model
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon or ring, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
