'use strict';

const roomManager = require('../roomManager');

function findMobByName(socket, room, targetName) {

  // autocomplete name by diplay name
  const mobDisplayNames = room.mobs.map(mob => mob.displayName);
  const completedDisplayNames = global.AutocompleteName(socket, targetName, mobDisplayNames);

  if (completedDisplayNames.length === 1) {
    return room.mobs.find(mob => mob.displayName === completedDisplayNames[0]);
  } else if (completedDisplayNames.length > 1) {
    // todo: possibly print out a list of the matches
    socket.emit('output', { message: 'Not specific enough!' });
    return;
  }

  // autocomplete name by diplay name
  const mobNames = room.mobs.map(mob => mob.name);
  const completedNames = global.AutocompleteName(socket, targetName, mobNames);

  if (completedNames.length === 1) {
    return room.mobs.find(mob => mob.name === completedNames[0]);
  } else if (completedNames.length > 1) {
    // todo: possibly print out a list of the matches
    socket.emit('output', { message: 'Not specific enough!' });
    return;
  }

  if (completedDisplayNames.length === 0 && completedNames.length === 0) {
    socket.emit('output', { message: 'You don\'t see that here!' });
    return;
  }

}

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

    const room = roomManager.getRoomById(socket.user.roomId);

    const target = findMobByName(socket, room, targetName);
    if(!target) {
      return;
    }

    socket.user.attackTarget = target.id;
    socket.user.attackInterval = 4000;

    socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
    socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} moves to attack ${target.displayName}!` });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">attack &lt;mob name&gt;<span class="purple">|</span> a</span> <span class="purple">-</span> Begin combat attacking &lt;target&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
