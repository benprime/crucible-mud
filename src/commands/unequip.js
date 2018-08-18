export default {
  name: 'unequip',

  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, hand) {

    let item;
    for (const i in socket.character.equipSlots) {
      if (!socket.character.equipSlots[i]) continue;
      if (socket.character.equipSlots[i].displayName == itemName || socket.character.equipSlots[i].name == itemName)
        item = socket.character.equipSlots[i];
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
        socket.character.equipSlots.weaponMain = null;
        break;
      case 'offHand':
        socket.character.equipSlots.weaponOff = null;
        break;
      case 'bothHand':
        socket.character.equipSlots.weaponMain = null;
        socket.character.equipSlots.weaponOff = null;
        break;
      case 'eitherHand':
        if (hand == 'main') {
          socket.character.equipSlots.weaponMain = null;
        }
        else if (hand == 'off') {
          socket.character.equipSlots.weaponOff = null;
        }
        else {
          socket.emit('output', { message: 'Please specify which hand to unequip the item from\n' });
          return;
        }
        break;
      case 'head':
        socket.character.equipSlots.head = null;
        break;
      case 'body':
        socket.character.equipSlots.body = null;
        break;
      case 'back':
        socket.character.equipSlots.back = null;
        break;
      case 'legs':
        socket.character.equipSlots.legs = null;
        break;
      case 'feet':
        socket.character.equipSlots.feet = null;
        break;
      case 'arms':
        socket.character.equipSlots.arms = null;
        break;
      case 'hands':
        socket.character.equipSlots.hands = null;
        break;
      case 'neck':
        socket.character.equipSlots.neck = null;
        break;
      case 'finger':
        if (hand == 'main') {
          socket.character.equipSlots.fingerMain = null;
        }
        else if (hand == 'off') {
          socket.character.equipSlots.fingerOff = null;
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
    socket.character.inventory.push(item);
    socket.character.save(err => { if (err) throw err; });

    socket.emit('output', { message: 'Item unequipped.\n' });

    //TODO: fix main/off hand selection (currently autocomplete takes in all parameters including the main/off hand bit...)
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    socket.emit('output', { message: output });
  },
};
