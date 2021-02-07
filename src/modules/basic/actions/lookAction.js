import Room from '../../../models/room';
import Item from '../../../models/item';
import Character from '../../../models/character';
import socketUtil from '../../../core/socketUtil';
import { Direction } from '../../../core/directions';

function lookDir(character, { exits }, dir) {
  const exit = exits.find(e => e.dir === dir.short);
  if (!exit || exit.hidden) {
    character.output('There is no exit in that direction!');
    return false;
  }

  if (exit.closed) {
    character.output('The door in that direction is closed!');
    return false;
  }

  const lookRoom = Room.getById(exit.roomId);
  let output = lookRoom.getDesc(character, false);

  // TODO: NICH SNEAKING
  //const roomOutput = `${character.name} looks to the ${Room.shortToLong(dir)}.\n`;
  //character.toRoom(roomOutput, [character.id]);

  const charOutput = `You look to the ${dir.long}...\n` + output;
  character.output(charOutput);
  character.toRoom(`${character.name} looks to the the ${dir.long}.`);
  socketUtil.roomMessage(lookRoom.id, `<span class="yellow">${character.name} peaks in from the ${dir.opposite.long}.</span>`, [character.id]);

  return;
}

export default {
  name: 'look',
  execute(character, short, lookTarget) {

    if (!lookTarget || lookTarget.hidden) {
      character.output('You don\'t see that here.');
      return;
    }

    if (lookTarget instanceof Room) {
      let output = lookTarget.getDesc(character, short);
      if(short) {
        output = `\n${output}`;
      }
      character.output(output);
      return;
    }

    // look called on direction
    if (lookTarget instanceof Direction) {
      const room = Room.getById(character.roomId);
      return lookDir(character, room, lookTarget);
    }

    let output = lookTarget.getDesc(character);
    if (lookTarget instanceof Item) {
      character.toRoom(`${character.name} looks at the ${lookTarget.name}.`);
    } else if (lookTarget instanceof Character) {
      character.toRoom(`${character.name} looks at ${lookTarget.name}.`);
    }
    character.output(output);
    return;
  },
};
