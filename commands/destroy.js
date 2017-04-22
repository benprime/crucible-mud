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
    console.log("Attempting to destroy: ", typeName, ": ", objectID);
    module.exports.execute(socket, typeName, objectID);
  },

  execute(socket, type, id) {

    if (type == 'mob') {
      // look for mob in user's current room
      roomManager.getRoomById(socket.user.roomId, (room) => {
        // locate mob
        const mobIndex = room.mobs.findIndex(mob => mob.id = id);
        if (mobIndex === -1) {
          socket.emit('output', { message: 'Unknown mob ID.' });
          return;
        }

        // delete mob
        room.mobs.splice(mobIndex, 1);

        // clean up after vortex caused by mob removal
        socket.emit('output', { message: 'Mob successfully destroyed.' });

        // announce mob disappearance to any onlookers
        socket.broadcast.to(room.id).emit('output', { message: `${mob.displayName} erased from existence!` });
      });
    }
    else if (type == 'item') {
      // look for mob in user's current room
      roomManager.getRoomById(socket.user.roomId, (room) => {
        // locate item
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
        socket.broadcast.to(room.id).emit('output', { message: `${item.displayName} erased from existence!` });

        // todo: determine if we want to hide when an admin creates and item      
        // socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} waves his hand and a ${createType.displayName} appears!` });
      });
    }
  },

  help() { },
};
