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
    const inventory = socket.user.inventory;

    // autocomplete name
    const itemNames = inventory.map(item => item.displayName);
    const completedNames = global.AutocompleteName(socket, itemName, itemNames);
    if (completedNames.length === 0) {
      socket.emit('output', { message: 'You don\'t have that item in your inventory.' });
      return;
    } else if (completedNames.length > 1) {
      // todo: possibly print out a list of the matches
      socket.emit('output', { message: 'Not specific enough!' });
      return;
    }

    const item = inventory.find(item => item.displayName === completedNames[0]);

    //if no match emit "itemName is not in your inventory" and return
    if (item.equip === 'non') {
      socket.emit('output', { message: 'You cannot equip that!' });
      return;
    }
      //if match add itemName to appropriate character item slot
      //add bonuses from itemName to corresponding character stats
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
