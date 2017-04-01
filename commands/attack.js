'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'attack',

  patterns: [
    /a\s+(\.+)$/i,
    /attack\s+(\.+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(match[1]);
  },

  execute(socket, targetName) {
    console.log(`Trying to attack the: ${targetName}`);

    roomManager.getRoomById(socket.user.roomId, function(room) {

      // autocomplete name
      //const mobInRoom = room.mobs || [];
      const mobNames = room.mobs.map(mob => mob.displayName);
      const resolvedName = global.ResolveName(socket, targetName, mobNames);

      console.log(`Auto completed name: ${resolvedName}`);

      const target = room.mobs.find(mob => mob.displayName === resolvedName);
      //console.log(`mobInRoom: ${JSON.stringify(mobInRoom)}`);
      //console.log(`target: ${JSON.stringify(target)}`);

      if (!target) {
        socket.emit("output", { message: "You don't see that here!" });
        return;
      }

      /*
      TODO: YOU CAN'T ATTACK PLAYERS UNTIL THERE IS A CHARACTER OBJECT BEING STORED SOMEWHERE FOR THEM
      if (!target) {
        // todo: this needs to be able to find a "character object..."
        let targetUserName = UsersInRoom(socket).find(function(user) {
          return user === targetName;
        });
      }
      */

      socket.attackTarget = target;

      //const username = globals.USERNAMES[socket.id];

      socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
      socket.broadcast.to(socket.room._id).emit('output', { message: `${socket.user.username} moves to attack ${resolvedName}!` });
      socket.attackInterval = 4000;
      //socket.attackTarget = resolvedName;
    });

  },

  help() {},
}
