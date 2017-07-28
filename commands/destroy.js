'use strict';

const roomManager = require('../roomManager');
const autocomplete = require('../autocomplete');

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
    console.log('Attempting to destroy: ', typeName, ': ', objectID);
    module.exports.execute(socket, typeName, objectID);
  },

  execute(socket, type, name) {

    const room = roomManager.getRoomById(socket.user.roomId);
    if (type === 'mob') {
      // look for mob in user's current room
      const mob = autocomplete.autocomplete(socket, ['mob'], name);
      if(!mob) {
        socket.emit('output', { message: 'You don\'t see that here.' });
        return;
      }

      room.mobs.remove(mob);

      // clean up after vortex caused by mob removal
      socket.emit('output', { message: 'Mob successfully destroyed.' });

      // announce mob disappearance to any onlookers
      socket.broadcast.to(room.id).emit('output', { message: 'Mob erased from existence!' });
    }
    else if (type === 'item') {
      var item = autocomplete.autocomplete(socket, ['inventory'], name);
      if(!item) {
        socket.emit('output', { message: 'You don\'t see that here.' });
        return;
      }

      // delete item
      socket.user.inventory.remove(item);
      socket.user.save();

      // clean up after vortex caused by item removal
      socket.emit('output', { message: 'Item successfully destroyed.' });

      // announce item disappearance to any onlookers
      socket.broadcast.to(room.id).emit('output', { message: 'Item erased from existence!' });

      // todo: determine if we want to hide when an admin destroys an item      
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">destroy mob &lt;mob ID&gt; </span><span class="purple">-</span> Remove <mob> from current room.<br />';
    output += '<span class="mediumOrchid">destroy item &lt;item ID&gt; </span><span class="purple">-</span> Remove <item> from inventory.<br />';
    socket.emit('output', { message: output });
  },
};
