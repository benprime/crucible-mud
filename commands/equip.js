'use strict';

module.exports = {
  name: 'equip',

  patterns: [
    /^eq$/i,
    /^equip$/i
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, hand) {
    //check user.inventory for itemName
    //if no match emit "itemName is not in your inventory" and return
    //if match add itemName to appropriate character item slot
    //add bonuses from itemName to corresponding character stats
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
