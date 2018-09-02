import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

export default {
  name: 'drop',
  desc: 'drop an inventory item on the ground',
  category: commandCategories.item,

  patterns: [
    /^dr\s+(.+)$/i,
    /^drop\s+(.+)$/i,
    /^drop/i,
    /^dr/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      socket.character.output('What do you want to drop?');
      return Promise.reject();
    }
    return this.execute(socket.character, match[1]);
  },

  execute(character, itemName) {
    const room = Room.getById(character.roomId);

    // drop an incapacitated player that is being dragged
    if (character.dragging) {
      const drag = socketUtil.getCharacterById(character.dragging);
      const re = new RegExp(`^${itemName}`, 'i');
      if (drag.name.match(re)) {
        character.dragging = false;
        character.output(`You stop dragging ${drag.name}.`);
        character.toRoom(`${character.name} drops ${drag.name}.`, [character.id]);
        return Promise.resolve();
      }
    }

    // drop items and keys
    const result = autocomplete.multiple(character, ['inventory', 'key'], itemName);
    if (!result) {
      character.output('You don\'t seem to be carrying that.');
      return Promise.reject();
    }

    // remove item from users inventory or key ring
    if (result.item.type === 'item') {
      if (character.equipped.isEquipped(result.item)) {
        character.equipped.unequip(result.item);
      }
      character.inventory.remove(result.item);
    } else if (result.item.type === 'key') {
      character.keys.remove(result.item);
    } else {
      // just a catch for bad data
      character.output('Unknown item type!');
      return Promise.reject();
    }

    // and place it in the room
    room.inventory.push(result.item);

    // save both
    room.save(err => { if (err) throw err; });
    character.save(err => { if (err) throw err; });

    character.output('Dropped.');
    character.toRoom(`${character.name} drops ${result.item.name}.`, [character.id]);

    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">drop &lt;item name&gt </span><span class="purple">-</span> Drop <item> from inventory onto the floor.<br>';
    character.output(output);
  },

};
