'use strict';

const autocomplete = require('../autocomplete');

module.exports = {
  name: 'equip',

  patterns: [
    /^eq\s+(.+)$/i,
    /^equip\s+(.+)$/i,
    /^equip$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, hand) {

    const item = autocomplete.autocomplete(socket, ['inventory'], itemName);

    // if no match emit "itemName is not in your inventory" and return
    if(!item) {
      socket.emit('output', { message: 'You don\'t seem be carrying that.\n' });
      return;
    }

    // check if item is equipable or return
    if (!item.equip) {
      socket.emit('output', { message: 'You cannot equip that!\n' });
      return;
    }

    // if match add itemName to appropriate character item slot
    switch (item.equip) {
      case '':
        break;
      case 'mainHand':
        socket.user.equipSlots.weaponMain = item;
        break;
      case 'offHand':
        socket.user.equipSlots.weaponOff = item;
        break;
      case 'bothHand':
        socket.user.equipSlots.weaponMain = item;
        socket.user.equipSlots.weaponOff = item;
        break;
      case 'eitherHand':
        if (hand == 'main') {
          socket.user.equipSlots.weaponMain = item;
        }
        else if (hand == 'off') {
          socket.user.equipSlots.weaponOff = item;
        }
        else {
          socket.emit('output', { message: 'Please specify which hand to equip the item\n' });
          return;
        }
        break;
      case 'head':
        socket.user.equipSlots.head = item;
        break;
      case 'body':
        socket.user.equipSlots.body = item;
        break;
      case 'back':
        socket.user.equipSlots.back = item;
        break;
      case 'legs':
        socket.user.equipSlots.legs = item;
        break;
      case 'feet':
        socket.user.equipSlots.feet = item;
        break;
      case 'arms':
        socket.user.equipSlots.arms = item;
        break;
      case 'hands':
        socket.user.equipSlots.hands = item;
        break;
      case 'neck':
        socket.user.equipSlots.neck = item;
        break;
      case 'finger':
        if (hand == 'main') {
          socket.user.equipSlots.fingerMain = item;
        }
        else if (hand == 'off') {
          socket.user.equipSlots.fingerOff = item;
        }
        else {
          socket.emit('output', { message: 'Please specify which hand to equip the item\n' });
          return;
        }
        break;
      default:
        socket.emit('output', { message: 'Um, you want to put that where?!?!\n' });
        return;

      //add bonuses from itemName to corresponding character stats
    }
    
    // remove item from backpack
    socket.user.inventory.remove(item);
    socket.user.save();

    socket.emit('output', { message: 'Item equipped.\n' });

    //TODO: fix main/off hand selection (currently autocomplete takes in all parameters including the main/off hand bit...)
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon or ring, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
