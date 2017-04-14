'use strict';

const Room = require('../models/room');
const roomManager = require('../roomManager');

const breakCommand = require('./break');
const lookCommand = require('./look');

function Feedback(dir) {
  const shortDir = global.LongToShort(dir);
  const displayDir = Room.exitName(shortDir);
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
    message = `${socket.user.username} runs into the wall to the ${Room.exitName(dir)}.`;
  }
  socket.broadcast.to(socket.user.roomId).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: 'There is no exit in that direction!' });
}

// emits "You hear movement to the <dir>" to all adjacent rooms
function MovementSounds(socket, room, excludeDir) {
  // fromRoomId is your current room (before move)
  room.exits.forEach((door) => {
    if (excludeDir && door.dir === excludeDir) {
      return;
    }

    let message = '';
    if (door.dir === 'u') {
      message = 'You hear movement from below.';
    } else if (door.dir === 'd') {
      message = 'You hear movement from above.';
    } else {
      message = `You hear movement to the ${Room.exitName(Room.oppositeDirection(door.dir))}.`;
    }

    // ES6 object literal shorthand syntax... message here becomes message: message
    socket.broadcast.to(door.roomId).emit('output', { message });
  });
}


module.exports = {
  name: "move",

  patterns: [
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
  ],

  dispatch(socket, match) {
    console.log(match);
    module.exports.execute(socket, match[0]);
  },

  execute(socket, dir) {
    let d = dir.toLowerCase();

    // changes "north" to "n" (just returns "n" if that's what's passed in)
    d = global.LongToShort(d);

    roomManager.getRoomById(socket.user.roomId, (room) => {

      // valid exit in that direction?
      const door = room.exits.find(exitDoor => exitDoor.dir === d);
      if (!door) {
        HitWall(socket, d);
        return;
      }

      let message = '';
      if (!room) {
        // hrmm if the exit was just validated, this should never happen.
        HitWall(socket, d);
        console.log("WARNING: Query couldn't find next room when going through a door.");
        return;
      }

      var username = socket.user.username;

      // send message to everyone in old room that player is leaving
      if (d === 'u') {
        message = `${username} has gone above.`;
      } else if (d === 'd') {
        message = `${username} has gone below.`;
      } else {
        message = `${username} has left to the ${Room.exitName(d)}.`;
      }

      // stop mobs attacking this user (since he is leaving the room)
      breakCommand.execute(socket);

      socket.broadcast.to(room.id).emit('output', { message });
      MovementSounds(socket, room, d);
      console.log("Leaving room: ", room.id);
      socket.leave(room.id);

      // update user session
      socket.user.roomId = door.roomId;
      console.log("Joining room: ", door.roomId);
      socket.user.save();
      socket.join(door.roomId);

      MovementSounds(socket, room, Room.oppositeDirection(d));

      // send message to everyone is new room that player has arrived
      if (d === 'u') {
        message = `${username} has entered from below.`;
      } else if (d === 'd') {
        message = `${username} has entered from above.`;
      } else {
        message = `${username} has entered from the ${Room.exitName(Room.oppositeDirection(d))}.`;
      }
      socket.broadcast.to(door.roomId).emit('output', { message });

      // You have moved south...
      socket.emit('output', { message: Feedback(dir) });
      lookCommand.execute(socket);
    });

  },

  help() { },
};
