'use strict';

const Room = require('../models/room');

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
    const room = Room.getRoomById(socket.user.roomId);
    dir = Room.ValidDirectionInput(dir);
    let exit = room.getExit(dir);
    if (!exit) {
      socket.emit('output', { message: 'No door in that direction.' });
      return;
    }

    if (!exit.locked) {
      socket.emit('output', { message: 'That door is not locked.' });
      return;
    }

    const keyNames = socket.user.keys.map(key => key.displayName);
    const keyCompletedNames = global.AutocompleteName(socket, keyName, keyNames);
    if (keyCompletedNames.length === 0) {
      socket.emit('output', { message: 'You are not carrying that key.' });
      return;
    }

    if (keyCompletedNames.length > 1) {
      // todo: print a list of matching keys
      socket.emit('output', { message: 'Which key did you mean?' });
      return;
    }

    const foundKey = socket.user.keys.find(key => key.displayName === keyCompletedNames[0]);
    if (foundKey.name != exit.keyName) {
      socket.emit('output', { message: 'That key does not unlock that door.' });
      return;
    }

    setTimeout(() => {
      exit.locked = true;
      let doorDesc;
      if (exit.dir === 'u') {
        doorDesc = 'above';
      } else if (exit.dir === 'd') {
        doorDesc = 'below';
      } else {
        doorDesc = `to the ${Room.exitName(exit.dir)}`;
      }

      if (exit.closed === true) {
        global.io.to(room.id).emit('output', { message: `The door ${doorDesc} clicks locked!` });
      } else {
        exit.closed = true;
        global.io.to(room.id).emit('output', { message: `The door ${doorDesc} slams shut and clicks locked!` });
      }
    }, 10000);

    exit.locked = false;
    socket.emit('output', { message: 'Door unlocked.' });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unlock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Unock a door with the key type you are carrying.<br />';
    socket.emit('output', { message: output });
  },

};
