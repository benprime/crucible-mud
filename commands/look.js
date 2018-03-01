'use strict';

const Room = require('../models/room');
const autocomplete = require('../autocomplete');

function lookDir(socket, room, dir) {
  dir = Room.validDirectionInput(dir);
  const exit = room.exits.find(e => e.dir === dir);
  if (!exit) {
    return;
  }

  if (exit.closed) {
    socket.emit('output', { message: 'The door in that direction is closed!' });
    return;
  }

  const lookRoom = Room.getById(exit.roomId);
  socket.emit('output', { message: `You look to the ${Room.shortToLong(dir)}...` });
  socket.broadcast.to(lookRoom.id).emit('output', { message: `<span class="yellow">${socket.user.username} peaks in from the ${Room.shortToLong(Room.oppositeDirection(dir))}.</span>` });
  lookRoom.look(socket, false);
}

// for items and mobs
function lookItem(socket, room, itemName) {
  const lookTargetObj = autocomplete.autocompleteTypes(socket, ['inventory', 'mob', 'room'], itemName);
  if (!lookTargetObj) {
    return;
  }
  lookTargetObj.look(socket);
}


module.exports = {
  name: 'look',

  patterns: [
    /^$/,
    /^l$/i,
    /^look$/i,
    /^look\s+(.+)$/i,
    /^read\s+(.+)$/i,
    /^l\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let lookTarget = null;
    if (match.length > 1) {
      lookTarget = match[1];
    }
    const short = (match[0] === '');
    module.exports.execute(socket, short, lookTarget);
  },

  execute(socket, short, lookTarget) {
    const room = Room.getById(socket.user.roomId);

    if (lookTarget) {
      lookTarget = lookTarget.toLowerCase();

      if (Room.validDirectionInput(lookTarget)) {
        lookDir(socket, room, lookTarget);
      } else {
        lookItem(socket, room, lookTarget);
      }
    } else {
      room.look(socket, short);
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';
    socket.emit('output', { message: output });
  },

};
