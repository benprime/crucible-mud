'use strict';

const Room = require('../models/room');
const autocomplete = require('../core/autocomplete');

function hideDir(socket, room, dir) {
  dir = Room.validDirectionInput(dir);
  let exit = room.getExit(dir);
  if (!exit) {
    socket.emit('output', { message: 'No exit in that direction.<br />' });
    return;
  }

  exit.hidden = true;
  room.save();
  socket.emit('output', { message: 'The exit has been concealed.<br />' });
}

// for items
function hideItem(socket, room, itemName) {
  const hideTargetObj = autocomplete.autocompleteTypes(socket, ['inventory', 'room'], itemName);
  if (!hideTargetObj) {
    socket.emit('output', { message: 'Item does not exist in inventory or in room.<br />' });
    return;
  }

  hideTargetObj.hidden = true;
  room.save();
  socket.emit('output', { message: `${itemName} has been concealed.<br />` });
}


module.exports = {
  name: 'hide',

  patterns: [
    /^hide$/i,
    /^hide\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let hideTarget = null;
    if (match.length > 1) {
      hideTarget = match[1];
    }
    else {
      module.exports.help(socket);
      return;
    }
    module.exports.execute(socket, hideTarget);
  },

  execute(socket, hideTarget) {
    const room = Room.getById(socket.user.roomId);

    if (hideTarget) {
      hideTarget = hideTarget.toLowerCase();

      if (Room.validDirectionInput(hideTarget)) {
        hideDir(socket, room, hideTarget);
      } else {
        hideItem(socket, room, hideTarget);
      }
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">hide &lt;item name/exit dir&gt; </span><span class="purple">-</span> Make target &lt;item name/exit dir&gt; hidden.<br />';
    socket.emit('output', { message: output });
  },

};
