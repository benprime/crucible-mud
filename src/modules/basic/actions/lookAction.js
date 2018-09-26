import Room from '../../../models/room';
import Item from '../../../models/item';
import Character from '../../../models/character';
import socketUtil from '../../../core/socketUtil';
import { Direction } from '../../../core/directions';

function lookDir(character, { exits }, dir) {
  const exit = exits.find(e => e.dir === dir.short);
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

    // TODO: NICH SNEAKING
    //const roomOutput = `${character.name} looks to the ${Room.shortToLong(dir)}.\n`;
    //character.toRoom(roomOutput, [character.id]);

    const charOutput = `You look to the ${dir.long}...\n` + output;
    character.output(charOutput);
    socketUtil.roomMessage(lookRoom.id, `<span class="yellow">${character.name} peaks in from the ${dir.opposite.long}.</span>`, [character.id]);

    return Promise.resolve();
  });
}

export default {
  name: 'look',
  execute(character, short, lookTarget) {

    // look called without parameters (looking at room)
    if (!lookTarget) {
      const room = Room.getById(character.roomId);
      return room.getDesc(character, short).then(output => {
        character.output(output);
        return Promise.resolve();
      });
    }

    // look called on direction
    if (lookTarget instanceof Direction) {
      const room = Room.getById(character.roomId);
      return lookDir(character, room, lookTarget);
    }

    // look called on item, monster, character
    if (!lookTarget || lookTarget.hidden) {
      character.output('You don\'t see that here.');
    }
    return lookTarget.getDesc(character).then(output => {
      if(lookTarget instanceof Item) {
        character.toRoom(`${character.name} looks at the ${lookTarget.name}.`);
      } else if(lookTarget instanceof Character) {
        character.toRoom(`${character.name} looks at ${lookTarget.name}.`);
      }
      character.output(output);
    });
  },
};
