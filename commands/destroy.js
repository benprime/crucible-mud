'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'destroy',
  admin: true,

  patterns: [
    /^destroy\s+(mob)\s+(\w+)$/i,
    /^destroy\s+(item)\s+(\w+)$/i,
    /^destroy\s+/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      // todo: print help
      socket.emit('output', { message: 'Invalid destroy usage.' });
      return;
    }
    let typeName = match[1];
    let objectID = match[2];
    console.log('Attempting to destroy: ', typeName, ': ', objectID);
    module.exports.execute(socket, typeName, objectID);
  },

  execute(socket, type, id) {

    if (type == 'mob') {
      // look for mob in user's current room
      const room = roomManager.getRoomById(socket.user.roomId);

      // locate mob
      const mobIndex = room.mobs.findIndex(mob => mob.id === id);
      if (mobIndex === -1) {
        socket.emit('output', { message: 'Unknown mob ID.' });
        return;
      }

      // delete mob
      room.mobs.splice(mobIndex, 1);

      // clean up after vortex caused by mob removal
      socket.emit('output', { message: 'Mob successfully destroyed.' });

      // announce mob disappearance to any onlookers
      socket.broadcast.to(room.id).emit('output', { message: 'Mob erased from existence!' });
    }
    else if (type == 'item') {
      // find user's current room
      const room = roomManager.getRoomById(socket.user.roomId);
      // look for item in user's inventory
      const itemIndex = socket.user.inventory.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        socket.emit('output', { message: 'Unknown item ID.' });
        return;
      }

      // delete item
      socket.user.inventory.splice(itemIndex, 1);
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
