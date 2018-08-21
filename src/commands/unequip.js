import socketUtil from '../core/socketUtil';
export default {
  name: 'unequip',

  patterns: [
    /^uneq\s+(.+)$/i,
    /^unequip\s+(.+)$/i,
    /^unequip$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1], match[2])
      .then(output => socketUtil.output(output))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, itemName, hand) {

    let item;
    for (const i in character.equipSlots) {
      if (!character.equipSlots[i]) continue;
      if (character.equipSlots[i].displayName == itemName || character.equipSlots[i].name == itemName)
        item = character.equipSlots[i];
    }

    // if no match emit error and return
    if (!item) {
      return Promise.reject('You don\'t have that equipped.\n');
    }

    // if match remove itemName from appropriate character item slot
    switch (item.equip) {
      case '':
        break;
      case 'mainHand':
        character.equipSlots.weaponMain = null;
        break;
      case 'offHand':
        character.equipSlots.weaponOff = null;
        break;
      case 'bothHand':
        character.equipSlots.weaponMain = null;
        character.equipSlots.weaponOff = null;
        break;
      case 'eitherHand':
        if (hand == 'main') {
          character.equipSlots.weaponMain = null;
        }
        else if (hand == 'off') {
          character.equipSlots.weaponOff = null;
        }
        else {
          return Promise.reject('Please specify which hand to unequip the item from\n');
        }
        break;
      case 'head':
        character.equipSlots.head = null;
        break;
      case 'body':
        character.equipSlots.body = null;
        break;
      case 'back':
        character.equipSlots.back = null;
        break;
      case 'legs':
        character.equipSlots.legs = null;
        break;
      case 'feet':
        character.equipSlots.feet = null;
        break;
      case 'arms':
        character.equipSlots.arms = null;
        break;
      case 'hands':
        character.equipSlots.hands = null;
        break;
      case 'neck':
        character.equipSlots.neck = null;
        break;
      case 'finger':
        if (hand == 'main') {
          character.equipSlots.fingerMain = null;
        }
        else if (hand == 'off') {
          character.equipSlots.fingerOff = null;
        }
        else {
          return Promise.reject('Please specify which hand to unequip the item from\n');
        }
        break;
      default:
        return Promise.reject('The item cannot be located on you.\n');

      //remove bonuses from itemName to corresponding character stats
    }

    // move item to backpack
    character.inventory.push(item);
    character.save(err => { if (err) throw err; });

    return Promise.resolve('Item unequipped.\n');

    //TODO: fix main/off hand selection (currently autocomplete takes in all parameters including the main/off hand bit...)
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unequip &lt;item name&gt;</span><span class="purple">-</span> Unequip an equipped &lt;item&gt; and move to inventory.  If multiples of &lt;item&gt; are equipped, specify main/off to unequip one hand or the other.<br />';
    socket.emit('output', { message: output });
  },
};
