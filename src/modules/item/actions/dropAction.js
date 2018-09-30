import Character from '../../../models/character';
import Room from '../../../models/room';

export default {
  name: 'drop',
  execute: (character, item, currency) => {
    const room = Room.getById(character.roomId);

    // drop an incapacitated player that is being dragged
    if (item instanceof Character) {
      const re = new RegExp(`^${item.name}`, 'i');
      if (item.name.match(re)) {
        character.dragging = false;
        character.output(`You stop dragging ${item.name}.`);
        character.toRoom(`${character.name} drops ${item.name}.`, [character.id]);
        return true;
      }
    }

    // drop items and keys
    if (!item) {
      character.output('You don\'t seem to be carrying that.');
      return false;
    }

    // remove item from users inventory or key ring
    if (item.type === 'item') {
      if (character.equipped.isEquipped(item.name)) {
        character.equipped.unequip(item);
      }
      character.inventory.remove(item);
    } else if (item.type === 'key') {
      character.keys.remove(item);
    } else {
      // just a catch for bad data
      character.output('Unknown item type!');
      return false;
    }

    // and place it in the room
    room.inventory.push(item);

    // save both
    room.save(err => { if (err) throw err; });
    character.save(err => { if (err) throw err; });

    character.output('Dropped.');
    character.toRoom(`${character.name} drops ${item.name}.`, [character.id]);

    return true;
  },
};