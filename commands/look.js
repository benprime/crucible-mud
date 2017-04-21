'use strict';

const roomManager = require('../roomManager');
const Room = require('../models/room');

module.exports = {
  name: 'look',

  patterns: [
    /^$/,
    /^l$/i,
    /^look$/i,
    /^look\s+(.+)$/i,
    /^l\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let item = null;
    if (match.length > 1) {
      item = match[1];
    }
    const short = (match[0] === '');
    module.exports.execute(socket, short, item);
  },

  execute(socket, short, itemName) {
    // get the room from the global cache
    roomManager.getRoomById(socket.user.roomId, (room) => {
      console.log('mobs:', room.mobs);
      if (itemName) {
        // check player inventory
        const itemNames = socket.user.inventory.map(item => item.displayName);
        const itemResolvedNames = global.ResolveName(socket, itemName, itemNames);

        // check room inventory
        const roomItemNames = room.inventory.map(item => item.displayName);
        const roomResolvedNames = global.ResolveName(socket, itemName, roomItemNames);

        // check mobs
        const mobNames = room.mobs.map(item => item.displayName);
        const mobResolvedNames = global.ResolveName(socket, itemName, mobNames);

        const totalFound = itemResolvedNames.length + roomResolvedNames.length + mobResolvedNames.length;
        if (totalFound > 1) {
          socket.emit('output', { message: 'Not specific enough!' });
          return;
        }

        if (totalFound === 0) {
          socket.emit('output', { message: 'You don\'t see that here.' });
          return;
        }

        let item = null;
        if(itemResolvedNames.length)
        {
          item = socket.user.inventory.find(item => item.displayName === itemResolvedNames[0]);
        } else if(roomResolvedNames.length) {
          item = room.inventory.find(item => item.displayName === roomResolvedNames[0]);
        } else if(mobResolvedNames.length) {
          item = room.mobs.find(mob => mob.displayName === mobResolvedNames[0]);
        }
        item.Look(socket);

      } else {
        room.Look(socket, short);
      }
    });
  },

  help() { },

};
