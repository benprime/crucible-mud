'use strict';

const Room = require('../models/room');

function Feedback(dir) {
  const shortDir = module.exports.LongToShort(dir);
  const displayDir = module.exports.ExitName(shortDir);
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
    message = `${socket.user.username} runs into the wall to the ${Room.ExitName(dir)}.`;
  }
  socket.broadcast.to(socket.room._id).emit('output', { message: `<span class="silver">${message}</span>` });
  socket.emit('output', { message: 'There is no exit in that direction!' });
}

// emits "You hear movement to the <dir>" to all adjacent rooms
function MovementSounds(socket, excludeDir) {
  // todo: hrmm, check if the room exists in socket io first?
  // I think the room doesn't exist in socket io if no one is currently joined to it.
  // could save processing time... since we don't need to write to sockets if
  // no one is in those rooms...

  // todo: currently not sending sounds to fromRoom or toRoom,
  // since those rooms get the standard "leaving" and "entering"
  // messages. This may change when sneaking is implemented.

  // fromRoomId is your current room (before move)
  socket.room.exits.forEach((door) => {
    /*
    if (door.roomId.toString() === fromRoomId.toString()) {
      return;
    }
    */

    if (excludeDir && door.dir === excludeDir) {
      return;
    }

    let message = '';
    if (door.dir === 'u') {
      message = 'You hear movement from below.';
    } else if (door.dir === 'd') {
      message = 'You hear movement from above.';
    } else {
      message = `You hear movement to the ${dirUtil.ExitName(dirUtil.OppositeDirection(door.dir))}.`;
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

  dispatch(socket, match) {},

  execute(socket, dir) {
    let d = dir.toLowerCase();

    // changes "north" to "n" (just returns "n" if that's what's passed in)
    d = dirUtil.LongToShort(d);

    // valid exit in that direction?
    const door = socket.room.exits.find(exitDoor => exitDoor.dir === d);
    if (!door) {
      HitWall(socket, d);
      return;
    }

    const roomsCollection = globals.DB.collection('rooms');
    roomsCollection.find({ _id: door.roomId }).toArray((err, docs) => {
      let message = '';
      if (docs.length === 0) {
        // hrmm if the exit was just validated, this should never happen.
        HitWall(socket, dir);
        console.log("WARNING: Query couldn't find next room when going through a door.");
        return;
      }

      // send message to everyone in old room that player is leaving
      if (dir === 'u') {
        message = `${globals.USERNAMES[socket.id]} has gone above.`;
      } else if (dir === 'd') {
        message = `${globals.USERNAMES[socket.id]} has gone below.`;
      } else {
        message = `${globals.USERNAMES[socket.id]} has left to the ${dirUtil.ExitName(dir)}.`;
      }

      // stop mobs attacking this user (since he is leaving the room)
      combat.Break(socket);
      combat.MobDisengage(socket);

      socket.broadcast.to(socket.room._id).emit('output', { message });
      MovementSounds(socket, d);
      socket.leave(socket.room._id);

      // update user session
      socket.room = docs[0];
      socket.join(socket.room._id);
      MovementSounds(socket, dirUtil.OppositeDirection(d));

      // update mongodb
      globals.DB.collection('users').update({ _id: socket.userId }, { $set: { roomId: socket.room._id } });



      // send message to everyone is new room that player has arrived
      if (dir === 'u') {
        message = `${globals.USERNAMES[socket.id]} has entered from below.`;
      } else if (dir === 'd') {
        message = `${globals.USERNAMES[socket.id]} has entered from above.`;
      } else {
        message = `${globals.USERNAMES[socket.id]} has entered from the ${dirUtil.ExitName(dirUtil.OppositeDirection(dir))}.`;
      }
      socket.broadcast.to(socket.room._id).emit('output', { message });

      // You have moved south...
      socket.emit('output', { message: dirUtil.Feedback(dir) });
      Look(socket);
    });

  },

  help() {},
}
