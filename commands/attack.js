'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'attack',

  patterns: [
    /a\s+(.+)$/i,
    /attack\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1]);
  },

  execute(socket, targetName) {
    console.log(`Trying to attack the: ${targetName}`);

    roomManager.getRoomById(socket.user.roomId, function(room) {

      // autocomplete name
      const mobNames = room.mobs.map(mob => mob.displayName);
      const resolvedName = global.ResolveName(socket, targetName, mobNames);

      console.log(`Auto completed name: ${resolvedName}`);

      const target = room.mobs.find(mob => mob.displayName === resolvedName);

      if (!target) {
        socket.emit("output", { message: "You don't see that here!" });
        return;
      }

      socket.user.attackTarget = target.id;
      socket.user.attackInterval = 4000;

      socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} moves to attack ${resolvedName}!` });
    });

  },

  help() {},
};
