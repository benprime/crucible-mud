import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';
import socketUtil from '../core/socketUtil';

export default {
  name: 'equip',

  patterns: [
    /^eq\s+(.+)$/i,
    /^equip\s+(.+)$/i,
    /^equip$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1], match[2])
      .then(response => socketUtil.sendMessages(socket, response))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, itemName, hand) {

    const acResult = autocomplete.autocompleteTypes(character, ['inventory'], itemName);
    if (!acResult) {
      return Promise.reject('item is not in inventory.');
    }

    const item = acResult.item;

    // check if item is equipable or return
    if (!item.equip) {
      return Promise.reject('You cannot equip that!\n');
    }

    // if match add itemName to appropriate character item slot
    switch (item.equip) {
      case '':
        break;
      case 'mainHand':
        character.equipSlots.weaponMain = item;
        break;
      case 'offHand':
        character.equipSlots.weaponOff = item;
        break;
      case 'bothHand':
        character.equipSlots.weaponMain = item;
        character.equipSlots.weaponOff = item;
        break;
      case 'eitherHand':
        if (hand == 'main') {
          character.equipSlots.weaponMain = item;
        }
        else if (hand == 'off') {
          character.equipSlots.weaponOff = item;
        }
        else {
          return Promise.reject('Please specify which hand to equip the item\n');
        }
        break;
      case 'head':
        character.equipSlots.head = item;
        break;
      case 'body':
        character.equipSlots.body = item;
        break;
      case 'back':
        character.equipSlots.back = item;
        break;
      case 'legs':
        character.equipSlots.legs = item;
        break;
      case 'feet':
        character.equipSlots.feet = item;
        break;
      case 'arms':
        character.equipSlots.arms = item;
        break;
      case 'hands':
        character.equipSlots.hands = item;
        break;
      case 'neck':
        character.equipSlots.neck = item;
        break;
      case 'finger':
        if (hand == 'main') {
          character.equipSlots.fingerMain = item;
        }
        else if (hand == 'off') {
          character.equipSlots.fingerOff = item;
        }
        else {
          return Promise.reject('Please specify which hand to equip the item\n');
        }
        break;
      default:
        return Promise.reject('Um, you want to put that where?!?!\n');

      //add bonuses from itemName to corresponding character stats
    }

    // remove item from backpack
    utils.removeItem(character.inventory, item);
    character.save(err => { if (err) throw err; });

    return Promise.resolve('Item equipped.\n');

    //TODO: fix main/off hand selection (currently autocomplete takes in all parameters including the main/off hand bit...)
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">equip &lt;item name&gt;</span><span class="purple">-</span> Equip &lt;item&gt; from inventory.  If &lt;item&gt; is a weapon or ring, specify main/off to equip to one hand or the other (if able).<br />';
    socket.emit('output', { message: output });
  },
};
