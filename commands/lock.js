'use strict';

const roomManager = require('../roomManager');
const autocomplete = require('../autocomplete');

module.exports = {
  name: 'lock',
  admin: true,

  patterns: [
    /^lock\s+(\w+)\s+with\s+(.+)$/i,
    /^lock\s+/i,
    /^lock$/i,
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
    dir = global.ValidDirectionInput(dir);
    let exit = room.getExit(dir);
    if (!exit || !('closed' in exit)) {
      socket.emit('output', { message: 'No door in that direction.' });
      return;
    }

    const key = autocomplete.autocomplete(socket, ['key'], keyName);
    if (!key) {
      socket.emit('output', { message: 'You are not carrying that key.' });
      return;
    }

    exit.closed = true;
    exit.keyName = key.name;
    exit.locked = true;
    room.save();
    socket.emit('output', { message: 'Door locked.' });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">lock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Lock a door with the key type you are carrying.<br />';
    socket.emit('output', { message: output });
  },

};
