'use strict';

const Room = require('../models/room');

const breakCommand = require('./break');
const lookCommand = require('./look');

function Feedback(dir) {
  const d = Room.validDirectionInput(dir);
  const displayDir = Room.shortToLong(d);
  return `You move ${displayDir}...`;
}

function HitWall(socket, dir) {
  let message = '';

  // send message to everyone in current room that player is running into stuff.
  if (dir === 'u') {
    message = `${socket.user.username} runs into the ceiling.`;
  } else if (dir === 'd') {
    message = `${socket.user.username} runs into the floor.`;
  } else {
    message = `${socket.user.username} runs into the wall to the ${Room.shortToLong(dir)}.`;
  }
  socket.broadcast.to(socket.user.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
}

function HitDoor(socket, dir) {
  let message = '';

  // send message to everyone in current room that player is running into stuff.
  if (dir === 'u') {
    message = `${socket.user.username} runs into the closed door above.`;
  } else if (dir === 'd') {
    message = `${socket.user.username} runs into the trapdoor on the floor.`;
  } else {
    message = `${socket.user.username} runs into the door to the ${Room.shortToLong(dir)}.`;
  }
  socket.broadcast.to(socket.user.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
}

// emits "You hear movement to the <dir>" to all adjacent rooms
function MovementSounds(socket, room, excludeDir) {
  // fromRoomId is your current room (before move)
  room.exits.forEach((exit) => {
    if (excludeDir && exit.dir === excludeDir) {
      return;
    }

    let message = '';
    if (exit.dir === 'u') {
      message = 'You hear movement from below.';
    } else if (exit.dir === 'd') {
      message = 'You hear movement from above.';
    } else {
      message = `You hear movement to the ${Room.shortToLong(Room.oppositeDirection(exit.dir))}.`;
    }

    // ES6 object literal shorthand syntax... message here becomes message: message
    socket.broadcast.to(exit.roomId).emit('output', { message });
  });
}

const commands = [
  /^go\s+(\w+)$/i,
  /^walk\s+(\w+)$/i,
  /^move\s+(\w+)$/i,
];

const directions = [
  /^n$/i,
  /^s$/i,
  /^e$/i,
  /^w$/i,
  /^ne$/i,
  /^nw$/i,
  /^se$/i,
  /^sw$/i,
  /^u$/i,
  /^d$/i,
  /^north$/i,
  /^south$/i,
  /^east$/i,
  /^west$/i,
  /^northeast$/i,
  /^northwest$/i,
  /^southeast$/i,
  /^southwest$/i,
  /^up$/i,
  /^down$/i,
];

module.exports = {
  name: 'move',

  patterns: commands.concat(directions),

  dispatch(socket, match) {
    // Multiple in the array means this matched to a command and not a direction
    let direction = match.length > 1 ? match[1] : match[0];
    module.exports.execute(socket, direction);
  },

  execute(socket, dir) {
    const d = Room.validDirectionInput(dir.toLowerCase());
    const room = Room.getById(socket.user.roomId);

    if (!room) {
      // hrmm if the exit was just validated, this should never happen.
      HitWall(socket, d);
      return;
    }

    // valid exit in that direction?
    const exit = room.exits.find(e => e.dir === d);
    if (!exit || exit.hidden) {
      HitWall(socket, d);
      return;
    }

    if (exit.closed) {
      HitDoor(socket, d);
      return;
    }

    let message = '';
    var username = socket.user.username;
    // send message to everyone in old room that player is leaving
    if (d === 'u') {
      message = `${username} has gone above.`;
    } else if (d === 'd') {
      message = `${username} has gone below.`;
    } else {
      message = `${username} has left to the ${Room.shortToLong(d)}.`;
    }

    // stop mobs attacking this user (since he is leaving the room)
    breakCommand.execute(socket);

    socket.broadcast.to(room.id).emit('output', { message });
    MovementSounds(socket, room, d);
    socket.leave(room.id);

    // update user session
    socket.user.roomId = exit.roomId;
    socket.user.save();
    socket.join(exit.roomId);

    MovementSounds(socket, room, Room.oppositeDirection(d));

    // send message to everyone is new room that player has arrived
    if (d === 'u') {
      message = `${username} has entered from below.`;
    } else if (d === 'd') {
      message = `${username} has entered from above.`;
    } else {
      message = `${username} has entered from the ${Room.shortToLong(Room.oppositeDirection(d))}.`;
    }
    socket.broadcast.to(exit.roomId).emit('output', { message });

    // You have moved south...
    socket.emit('output', { message: Feedback(dir) });
    lookCommand.execute(socket);
  },

  help(socket) {
    let output = '';
    output += '<span class="cyan">move command </span><span class="darkcyan">-</span> Move in specified direction. Move command word is not used.<br />';
    output += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
    output += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
    output += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
    output += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
    output += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
    output += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
    output += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
    output += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
    output += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
    output += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br />';
    socket.emit('output', { message: output });
  },
};
