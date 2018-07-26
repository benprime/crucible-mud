const Room = require('../models/room');
const autocomplete = require('../core/autocomplete');

module.exports = {
  name: 'destroy',
  admin: true,

  patterns: [
    /^destroy\s+(mob)\s+(.+)$/i,
    /^destroy\s+(item)\s+(.+)$/i,
    /^destroy/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      module.exports.help(socket);
      return;
    }
    let typeName = match[1];
    let objectID = match[2];
    module.exports.execute(socket, typeName, objectID);
  },

  execute(socket, type, name) {

    const room = Room.getById(socket.user.roomId);
    if (type === 'mob') {
      // look for mob in user's current room
      const mob = autocomplete.autocompleteTypes(socket, ['mob'], name);
      if (!mob) {
        return;
      }

      room.mobs.remove(mob);
      socket.emit('output', { message: 'Mob successfully destroyed.' });

      // announce mob disappearance to any onlookers
      socket.broadcast.to(room.id).emit('output', { message: 'Mob erased from existence!' });
    }
    else if (type === 'item') {
      const item = autocomplete.autocompleteTypes(socket, ['inventory'], name);
      if (!item) {
        return;
      }

      // delete item
      socket.user.inventory.remove(item);
      socket.user.save();
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
