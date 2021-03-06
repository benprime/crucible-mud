import Room from '../../../models/room';
import autocomplete from '../../../core/autocomplete';
import utils from '../../../core/utilities';

export default {
  name: 'destroy',
  execute(character, type, name) {

    const room = Room.getById(character.roomId);
    if (type === 'mob') {
      // look for mob in user's current room
      const acResult = autocomplete.multiple(character, ['mob'], name);
      if (!acResult) {
        character.output('Mob not found.');
        return false;
      }
      const mob = acResult.item;

      // mobs is a non-mongoose array, so must use removeItem
      let removedItem = utils.removeItem(room.mobs, mob);
      if (!removedItem) {
        character.output('Something went terribly wrong.');
        return false;
      } else {
        character.output('Mob successfully destroyed.');
        character.toRoom(`${character.name} erases ${mob.name} from existence!`, [character.id]);
        return true;
      }
    }
    else if (type === 'item') {
      const acResult = autocomplete.multiple(character, ['inventory'], name);
      if (!acResult) {
        character.output('You don\'t seem to be carrying that item.');
        return false;
      }

      // delete item
      character.inventory.id(acResult.item.id).remove();
      character.save(err => { if (err) throw err; });
      character.output('Item successfully destroyed.');
      return true;
    } else {
      character.output('Invalid destroy type.');
      return false;
    }
  },
};
