import Room from '../models/room';
import commandCategories from '../core/commandCategories';
import { getDirection, Direction } from '../core/directions';

export default {
  name: 'create door',
  desc: 'creates a door on an existing exit',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^create\s+(door)\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    const dir = getDirection(match[2]);
    return this.execute(socket.character, dir);
  },

  execute(character, dir) {
    if(!(dir instanceof Direction)) {
      character.output('Invalid direction.');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);

    const exit = room.getExit(dir.short);

    if (!exit) {
      character.output('No exit exists in that direction.');
      return Promise.reject();
    }

    if (exit.closed !== undefined) {
      character.output('Door already exists.');
      return Promise.reject();
    }

    exit.closed = true;
    room.save(err => { if (err) throw err; });
    character.output('Door created.');
    character.toRoom(`${character.name} waves his hand and a door appears to the ${dir.long}!`, [character.id]);
    return Promise.resolve();
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
