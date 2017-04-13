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
  ],

  dispatch(socket, match) {
    let item = null;
    let command = match[0];
    if (match.length > 1) {
      item = match[1];
    }
    module.exports.execute(socket, command, item);
  },

  execute(socket, command, item) {

    // get the room from the global cache
    roomManager.getRoomById(socket.user.roomId, (room) => {
      console.log('mobs:', room.mobs);

      //const exits = socket.room.exits || [];
      //const inventory = socket.room.inventory || [];

      let output = `<span class='cyan'>${room.name}</span>\n`;

      if (command != '') {
        output += `<span class='silver'>${room.desc}</span>\n`;
      }

      /*
          if (room.inventory.length > 0) {
            output += `<span class='darkcyan'>You notice: ${inventory.map(item => item.name).join(', ')}.</span>\n`;
          }
      */
      let names = global.UsersInRoom(room.id).filter(name => name !== socket.user.username);

      console.log("Users in room names: ", names);



      const mobNames = room.mobs.map(mob => mob.displayName + ' ' + mob.hp);
      if (mobNames) { names = names.concat(mobNames); }
      const displayNames = names.join('<span class=\'mediumOrchid\'>, </span>');

      if (displayNames) {
        output += `<span class='purple'>Also here: <span class='teal'>${displayNames}</span>.</span>\n`;
      }

      if (room.exits.length > 0) {
        output += `<span class='green'>Exits: ${room.exits.map(door => Room.exitName(door.dir)).join(', ')}</span>\n`;
      }

      socket.emit('output', { message: output });
    });
  },

  help() {},

};
