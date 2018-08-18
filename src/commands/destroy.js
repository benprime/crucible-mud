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
    this.execute(socket, typeName, objectID);
  },

  execute(socket, type, name) {

    const room = Room.getById(socket.character.roomId);
    if (type === 'mob') {
      // look for mob in user's current room
      const acResult = autocomplete.autocompleteTypes(socket, ['mob'], name);
      if (!acResult) {
        return;
      }
      const mob = acResult.item;

      // mobs is a non-mongoose array, so must use removeItem
      let removedItem = utils.removeItem(room.mobs, mob);
      if (!removedItem) {
        socket.emit('output', { message: 'Something went terribly wrong.' });
      } else {
        socket.emit('output', { message: 'Mob successfully destroyed.' });
        // announce mob disappearance to any onlookers
        socket.broadcast.to(room.id).emit('output', { message: 'Mob erased from existence!' });
      }
    }
    else if (type === 'item') {
      const acResult = autocomplete.autocompleteTypes(socket, ['inventory'], name);
      if (!acResult) {
        return;
      }

      // delete item
      // inventory is a mongoose-controlled array, so this must use .remove
      socket.character.inventory.id(acResult.item.id).remove();
      socket.character.save(err => { if (err) throw err; });
      socket.emit('output', { message: 'Item successfully destroyed.' });
    } else {
      socket.emit('output', { message: 'Invalid destroy type.' });
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">destroy mob &lt;mob ID&gt; </span><span class="purple">-</span> Remove <mob> from current room.<br />';
    output += '<span class="mediumOrchid">destroy item &lt;item ID&gt; </span><span class="purple">-</span> Remove <item> from inventory.<br />';
    socket.emit('output', { message: output });
  },
};
