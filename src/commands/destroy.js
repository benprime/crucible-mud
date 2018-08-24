import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';

export default {
  name: 'destroy',
  admin: true,

  patterns: [
    /^destroy\s+(mob)\s+(.+)$/i,
    /^destroy\s+(item)\s+(.+)$/i,
    /^destroy/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      this.help(socket);
      return;
    }
    let typeName = match[1];
    let objectID = match[2];
    this.execute(socket.character, typeName, objectID);
  },

  execute(character, type, name) {

    const room = Room.getById(character.roomId);
    if (type === 'mob') {
      // look for mob in user's current room
      const acResult = autocomplete.autocompleteTypes(character, ['mob'], name);
      if (!acResult) {
        return Promise.reject('Mob not found.');
      }
      const mob = acResult.item;

      // mobs is a non-mongoose array, so must use removeItem
      let removedItem = utils.removeItem(room.mobs, mob);
      if (!removedItem) {
        return Promise.reject('Something went terribly wrong.');
      } else {
        return Promise.resolve({
          charMessages: [
            { charId: character.id, message: 'Mob successfully destroyed.' },
          ],
          roomMessages: [
            { roomId: character.roomId, message: `${character.name} erases ${mob.display} from existence!`, exclude: [character.id] },
          ],
        });
      }
    }
    else if (type === 'item') {
      const acResult = autocomplete.autocompleteTypes(character, ['inventory'], name);
      if (!acResult) {
        return Promise.reject('You don\'t seem to be carrying that item.');
      }

      // delete item
      // inventory is a mongoose-controlled array, so this must use .remove
      character.inventory.id(acResult.item.id).remove();
      character.save(err => { if (err) throw err; });
      return Promise.resolve('Item successfully destroyed.');
    } else {
      return Promise.reject('Invalid destroy type.');
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">destroy mob &lt;mob ID&gt; </span><span class="purple">-</span> Remove <mob> from current room.<br />';
    output += '<span class="mediumOrchid">destroy item &lt;item ID&gt; </span><span class="purple">-</span> Remove <item> from inventory.<br />';
    socket.emit('output', { message: output });
  },
};
