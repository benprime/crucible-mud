import { Direction } from '../../../core/directions';
import Room from '../../../models/room';

export default {
  name: 'close',
  execute(character, dir) {

    if (!(dir instanceof Direction)) {
      character.output('Invalid direction.');
      return false;
    }

    const room = Room.getById(character.roomId);
    const exit = room.exits.find(e => e.dir === dir.short);
    if (!exit) {
      character.output('There is no exit in that direction!');
      return false;
    }

    if (exit.closed === undefined) {
      character.output('There is no door in that direction!');
      return false;
    }

    exit.closed = true;
    character.output('Door closed.');
    character.toRoom(`${character.name} closes the door to the ${dir.long}.`, [character.id]);
    return true;
  },
};
