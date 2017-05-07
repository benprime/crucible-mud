'use strict';

const roomManager = require('../roomManager');
const Room = require('../models/room');

function lookDir(socket, room, dir) {
  dir = global.LongToShort(dir);
  const exit = room.exits.find(e => e.dir === dir);
  if (!exit) {
    return;
  }

  if (exit.closed) {
    socket.emit('output', { message: 'The door in that direction is closed!' });
    return;
  }

  const lookRoom = roomManager.getRoomById(exit.roomId);
  socket.emit('output', { message: `You look to the ${Room.exitName(dir)}...` });
  socket.broadcast.to(lookRoom.id).emit('output', { message: `<span class="yellow">${socket.user.username} peaks in from the ${Room.exitName(Room.oppositeDirection(dir))}.</span>` });
  lookRoom.Look(socket, false);
}

// for items and mobs
function lookItem(socket, room, itemName) {
  // check player inventory
  const itemNames = socket.user.inventory.map(item => item.displayName);
  const itemcompletedNames = global.AutocompleteName(socket, itemName, itemNames);

  // check room inventory
  const roomItemNames = room.inventory.map(item => item.displayName);
  const roomcompletedNames = global.AutocompleteName(socket, itemName, roomItemNames);

  // check mobs
  const mobNames = room.mobs.map(item => item.displayName);
  const mobcompletedNames = global.AutocompleteName(socket, itemName, mobNames);

  const totalFound = itemcompletedNames.length + roomcompletedNames.length + mobcompletedNames.length;
  if (totalFound > 1) {
    socket.emit('output', { message: 'Not specific enough!' });
    return;
  }

  if (totalFound === 0) {
    socket.emit('output', { message: 'You don\'t see that here.' });
    return;
  }

  let item = null;
  if (itemcompletedNames.length) {
    item = socket.user.inventory.find(item => item.displayName === itemcompletedNames[0]);
  } else if (roomcompletedNames.length) {
    item = room.inventory.find(item => item.displayName === roomcompletedNames[0]);
  } else if (mobcompletedNames.length) {
    item = room.mobs.find(mob => mob.displayName === mobcompletedNames[0]);
  }
  item.Look(socket);
}


module.exports = {
  name: 'look',

  patterns: [
    /^$/,
    /^l$/i,
    /^look$/i,
    /^look\s+(.+)$/i,
    /^l\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    let item = null;
    if (match.length > 1) {
      item = match[1];
    }
    const short = (match[0] === '');
    module.exports.execute(socket, short, item);
  },

  execute(socket, short, itemName) {
    const room = roomManager.getRoomById(socket.user.roomId);

    if (itemName) {
      itemName = itemName.toLowerCase();

      if (global.ValidDirectionInput(itemName)) {
        lookDir(socket, room, itemName);
      } else {
        lookItem(socket, room, itemName);
      }
    } else {
      room.Look(socket, short);
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';
    socket.emit('output', { message: output });
  },

};
