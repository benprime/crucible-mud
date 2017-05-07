'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'unlock',
  admin: true,

  patterns: [
    /^unlock\s+(\w+)\s+with\s+(.+)$/i,
    /^unlock\s+/i,
    /^unlock$/i,
  ],

  dispatch(socket, match) {
    console.log(match);
    if (match.length != 3) {
      module.exports.help(socket);
      return;
    }
    const dir = match[1].toLowerCase();
    const keyName = match[2];
    module.exports.execute(socket, dir, keyName);
  },

  execute(socket, dir, keyName) {
    const room = roomManager.getRoomById(socket.user.roomId);
    dir = global.LongToShort(dir);
    let exit = room.getExit(dir);
    if (!exit) {
      socket.emit('output', { message: 'No door in that direction.' });
      return;
    }

    if (!exit.locked) {
      socket.emit('output', { message: 'That door is not locked.' });
      return;
    }

    let foundKey = socket.user.keys.find(key => key.name.toLowerCase() === keyName.toLowerCase());
    if (!foundKey) {
      socket.emit('output', { message: 'You are not carrying that key.' });
      return;
    }

    if (foundKey.name != exit.keyName) {
      socket.emit('output', { message: 'That key does not unlock that door.' });
      return;
    }

    exit.locked = false;
    room.save();
    socket.emit('output', { message: 'Door unlocked.' });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unlock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Unock a door with the key type you are carrying.<br />';
    socket.emit('output', { message: output });
  },

};
