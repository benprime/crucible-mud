import Room from '../models/room';
import autocomplete from '../core/autocomplete';

function lookDir(socket, {exits}, dir) {
  dir = Room.validDirectionInput(dir);
  const exit = exits.find(e => e.dir === dir);
  if (!exit || exit.hidden) {
    socket.emit('output', { message: 'There is no exit in that direction!' });
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
  if (!lookTargetObj || lookTargetObj.hidden) {
    socket.emit('output', { message: 'Unknown item!' });
    return;
  }
  lookTargetObj.look(socket);
}


export default {
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
    this.execute(socket, short, lookTarget);
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
