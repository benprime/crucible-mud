import { Direction } from '../../../core/directions';
import Room from '../../../models/room';

export default {
  name: 'open',
  execute(character, dir) {
    if (!(dir instanceof Direction)) {
      character.output('Invalid direction.');
      return;
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

    if (exit.locked) {
      character.output('That door is locked.');
      return false;
    }

    if (exit.closed === false) {
      character.output('That door is already open.');
      return false;
    }

    exit.closed = false;
    character.output('Door opened.');
    character.toRoom(`${character.name} opens the door to the ${dir.long}.`, [character.id]);
    return true;
  },
};




