'use strict';

const autocomplete = require('../autocomplete');

module.exports = {
  name: 'unequip',

  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, hand) {

    var item;
    for (var i in socket.user.equipSlots) {
      if(!socket.user.equipSlots[i]) continue;
      if (socket.user.equipSlots[i].displayName == itemName || socket.user.equipSlots[i].name == itemName)
        item = socket.user.equipSlots[i];
    }

    // if no match emit error and return
    if (!item) {
      socket.emit('output', { message: 'You don\'t have that equipped.\n' });
      return;
    }

    // if match remove itemName from appropriate character item slot
    switch (item.equip) {
      case '':
        break;
      case 'mainHand':
        socket.user.equipSlots.weaponMain = null;
        break;
      case 'offHand':
        socket.user.equipSlots.weaponOff = null;
        break;
      case 'bothHand':
        socket.user.equipSlots.weaponMain = null;
        socket.user.equipSlots.weaponOff = null;
        break;
      case 'eitherHand':
        if (hand == 'main') {
          socket.user.equipSlots.weaponMain = null;
        }
        else if (hand == 'off') {
          socket.user.equipSlots.weaponOff = null;
        }
        else {
          socket.emit('output', { message: 'Please specify which hand to unequip the item from\n' });
          return;
        }
        break;
      case 'head':
        socket.user.equipSlots.head = null;
        break;
      case 'body':
        socket.user.equipSlots.body = null;
        break;
      case 'back':
        socket.user.equipSlots.back = null;
        break;
      case 'legs':
        socket.user.equipSlots.legs = null;
        break;
      case 'feet':
        socket.user.equipSlots.feet = null;
        break;
      case 'arms':
        socket.user.equipSlots.arms = null;
        break;
      case 'hands':
        socket.user.equipSlots.hands = null;
        break;
      case 'neck':
        socket.user.equipSlots.neck = null;
        break;
      case 'finger':
        if (hand == 'main') {
          socket.user.equipSlots.fingerMain = null;
        }
        else if (hand == 'off') {
          socket.user.equipSlots.fingerOff = null;
        }
        else {
          socket.emit('output', { message: 'Please specify which hand to unequip the item from\n' });
          return;
        }
        break;
      default:
        socket.emit('output', { message: 'The item cannot be located on you.\n' });
        return;

      //remove bonuses from itemName to corresponding character stats
    }

    // move item to backpack
    socket.user.inventory.push(item);
    socket.user.save();

    socket.emit('output', { message: 'Item unequipped.\n' });

    //TODO: fix main/off hand selection (currently autocomplete takes in all parameters including the main/off hand bit...)
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    socket.emit('output', { message: output });
  },
};
