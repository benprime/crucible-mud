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
    if (match.length > 1) {
      item = match[1];
    }
    const short = (match[0] == '');
    module.exports.execute(socket, short, item);
  },

  execute(socket, short, item) {

    // get the room from the global cache
    roomManager.getRoomById(socket.user.roomId, (room) => {
      console.log('mobs:', room.mobs);

      let output = `<span class='cyan'>${room.name}</span>\n`;

      if (!short) {
        output += `<span class='silver'>${room.desc}</span>\n`;
      }

      // rodo: remove first check after old data has been purged
      if (room.inventory && room.inventory.length > 0) {
        output += `<span class='darkcyan'>You notice: ${room.inventory.map(item => item.displayName).join(', ')}.</span>\n`;
      }

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

  help() { },

};
