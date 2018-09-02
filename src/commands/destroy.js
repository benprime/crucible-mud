import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';
import commandCategories from '../core/commandCategories';

export default {
  name: 'destroy',
  desc: 'destroy an item or mob instance',
  category: commandCategories.admin,
  admin: true,

  patterns: [
    /^destroy\s+(mob)\s+(.+)$/i,
    /^destroy\s+(item)\s+(.+)$/i,
    /^destroy/i,
    /^des\s+(mob)\s+(.+)$/i,
    /^des\s+(item)\s+(.+)$/i,
    /^des/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      this.help(socket.character);
      return Promise.resolve();
    }
    let typeName = match[1];
    let objectID = match[2];
    return this.execute(socket.character, typeName, objectID);

  },

  execute(character, type, name) {

    const room = Room.getById(character.roomId);
    if (type === 'mob') {
      // look for mob in user's current room
      const acResult = autocomplete.multiple(character, ['mob'], name);
      if (!acResult) {
        character.output('Mob not found.');
        return Promise.reject();
      }
      const mob = acResult.item;

      // mobs is a non-mongoose array, so must use removeItem
      let removedItem = utils.removeItem(room.mobs, mob);
      if (!removedItem) {
        character.output('Something went terribly wrong.');
        return Promise.reject();
      } else {
        character.output('Mob successfully destroyed.');
        character.toRoom(`${character.name} erases ${mob.name} from existence!`, [character.id]);
        return Promise.resolve();
      }
    }
    else if (type === 'item') {
      const acResult = autocomplete.multiple(character, ['inventory'], name);
      if (!acResult) {
        character.output('You don\'t seem to be carrying that item.');
        return Promise.reject();
      }

      // delete item
      character.inventory.id(acResult.item.id).remove();
      character.save(err => { if (err) throw err; });
      character.output('Item successfully destroyed.');
      return Promise.resolve();
    } else {
      character.output('Invalid destroy type.');
      return Promise.reject();
    }
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">destroy mob &lt;mob ID&gt; </span><span class="purple">-</span> Remove <mob> from current room.<br />';
    output += '<span class="mediumOrchid">destroy item &lt;item ID&gt; </span><span class="purple">-</span> Remove <item> from inventory.<br />';
    character.output(output);
  },
};
