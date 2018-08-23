import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';

export default {
  name: 'equip',

  patterns: [
    /^eq\s+(.+)$/i,
    /^equip\s+(.+)$/i,
    /^equip$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1], match[2]);
  },

  execute(socket, itemName, hand) {

    const acResult = autocomplete.autocompleteTypes(socket, ['inventory'], itemName);
    if (!acResult) {
      return;
    }

    const item = acResult.item;

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
        socket.character.equipSlots.weaponMain = item;
        break;
      case 'offHand':
        socket.character.equipSlots.weaponOff = item;
        break;
      case 'bothHand':
        socket.character.equipSlots.weaponMain = item;
        socket.character.equipSlots.weaponOff = item;
        break;
      case 'eitherHand':
        if (hand == 'main') {
          socket.character.equipSlots.weaponMain = item;
        }
        else if (hand == 'off') {
          socket.character.equipSlots.weaponOff = item;
        }
        else {
          socket.emit('output', { message: 'Please specify which hand to equip the item\n' });
          return;
        }
        break;
      case 'head':
        socket.character.equipSlots.head = item;
        break;
      case 'body':
        socket.character.equipSlots.body = item;
        break;
      case 'back':
        socket.character.equipSlots.back = item;
        break;
      case 'legs':
        socket.character.equipSlots.legs = item;
        break;
      case 'feet':
        socket.character.equipSlots.feet = item;
        break;
      case 'arms':
        socket.character.equipSlots.arms = item;
        break;
      case 'hands':
        socket.character.equipSlots.hands = item;
        break;
      case 'neck':
        socket.character.equipSlots.neck = item;
        break;
      case 'finger':
        if (hand == 'main') {
          socket.character.equipSlots.fingerMain = item;
        }
        else if (hand == 'off') {
          socket.character.equipSlots.fingerOff = item;
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
    utils.removeItem(socket.character.inventory, item);
    socket.character.save(err => { if (err) throw err; });

    socket.emit('output', { message: 'Item equipped.\n' });

    //TODO: fix main/off hand selection (currently autocomplete takes in all parameters including the main/off hand bit...)
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon or ring, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
