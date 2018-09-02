import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

function lookDir(character, { exits }, dir) {
  dir = Room.validDirectionInput(dir);
  const exit = exits.find(e => e.dir === dir);
  if (!exit || exit.hidden) {
    character.output('There is no exit in that direction!');
    return Promise.reject();
  }

  if (exit.closed) {
    character.output('The door in that direction is closed!');
    return Promise.reject();
  }

  const lookRoom = Room.getById(exit.roomId);
  return lookRoom.getDesc(character, false).then(output => {

    //const roomOutput = `${character.name} looks to the ${Room.shortToLong(dir)}.\n`;
    //character.toRoom(roomOutput, [character.id]);

    const charOutput = `You look to the ${Room.shortToLong(dir)}...\n` + output;
    character.output(charOutput);
    socketUtil.roomMessage(lookRoom.id, `<span class="yellow">${character.name} peaks in from the ${Room.shortToLong(Room.oppositeDirection(dir))}.</span>`, [character.id]);

    return Promise.resolve();
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
    return this.execute(socket.character, short, lookTarget);
  },

  execute(character, short, lookTarget) {

    if (!lookTarget) {
      const room = Room.getById(character.roomId);
      return room.getDesc(character, short).then(output => {
        character.output(output);
        return Promise.resolve();
      });
    }

    lookTarget = lookTarget.toLowerCase();

    if (lookTarget === 'me' || lookTarget === 'self') {
      return character.getDesc().then(output => {
        character.output(output);
        return Promise.resolve();
      });
    }

    if (Room.validDirectionInput(lookTarget)) {
      const room = Room.getById(character.roomId);
      return lookDir(character, room, lookTarget);
    }

    const acResult = autocomplete.multiple(character, ['inventory', 'mob', 'room', 'character'], lookTarget);
    if (!acResult || acResult.item.hidden) {
      character.output('You don\'t see that here.');
      return Promise.reject();
    }
    return acResult.item.getDesc(character).then(output => {
      character.toRoom(`${character.name} looks at the ${acResult.item}.`);
      character.output(output);
    });
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';
    character.output(output);
  },

};
