import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';

function lookDir(character, { exits }, dir) {
  dir = Room.validDirectionInput(dir);
  const exit = exits.find(e => e.dir === dir);
  if (!exit || exit.hidden) {
    return Promise.reject('There is no exit in that direction!');
  }

  if (exit.closed) {
    return Promise.reject('The door in that direction is closed!');
  }

  const lookRoom = Room.getById(exit.roomId);
  return lookRoom.look(character, false).then(output => {
    const actionOutput = `You look to the ${Room.shortToLong(dir)}...\n` + output;
    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: actionOutput },
      ],
      roomMessages: [
        { roomId: lookRoom.id, message: `<span class="yellow">${character.name} peaks in from the ${Room.shortToLong(Room.oppositeDirection(dir))}.</span>`, exclude: [character.id] },
      ],
    });
  });
}

// for items and mobs
function lookItem(charater, itemName) {
  const acResult = autocomplete.autocompleteTypes(charater, ['inventory', 'mob', 'room'], itemName);
  if (!acResult || acResult.item.hidden) {
    return Promise.reject('You don\'t see that here.');
  }
  const output = acResult.item.look(charater);
  return Promise.resolve(output);
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
    this.execute(socket.character, short, lookTarget)
      .then(response => socketUtil.sendMessages(socket, response))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, short, lookTarget) {
    const room = Room.getById(character.roomId);

    if (lookTarget) {
      lookTarget = lookTarget.toLowerCase();

      if (Room.validDirectionInput(lookTarget)) {
        return lookDir(character, room, lookTarget);
      } else {
        return lookItem(character, lookTarget);
      }
    } else {
      return room.look(character, short);
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';
    socket.emit('output', { message: output });
  },

};
