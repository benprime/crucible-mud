import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

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
  return lookRoom.getDesc(character, false).then(output => {
    const charOuput = `You look to the ${Room.shortToLong(dir)}...\n` + output;
    const roomOutput = `${character.name} looks to the ${Room.shortToLong(dir)}.\n`;
    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: charOuput },
      ],
      roomMessages: [
        { roomId: character.roomId, message: roomOutput, exclude: [character.id] },
        { roomId: lookRoom.id, message: `<span class="yellow">${character.name} peaks in from the ${Room.shortToLong(Room.oppositeDirection(dir))}.</span>`, exclude: [character.id] },
      ],
    });
  });
}

export default {
  name: 'look',
  desc: 'look around you or examine an item, mob, or player',
  category: commandCategories.basic,

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

    if (!lookTarget) {
      const room = Room.getById(character.roomId);
      return room.getDesc(character, short);
    }

    lookTarget = lookTarget.toLowerCase();

    if (lookTarget === 'me' || lookTarget === 'self') {
      return character.getDesc();
    }

    if (Room.validDirectionInput(lookTarget)) {
      const room = Room.getById(character.roomId);
      return lookDir(character, room, lookTarget);
    }

    const acResult = autocomplete.multiple(character, ['inventory', 'mob', 'room', 'character'], lookTarget);
    if (!acResult || acResult.item.hidden) {
      return Promise.reject('You don\'t see that here.');
    }
    return acResult.item.getDesc(character);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';
    socket.emit('output', { message: output });
  },

};
