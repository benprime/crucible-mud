import Room from '../models/room';
import commandCategories from '../core/commandCategories';
import { getDirection } from '../core/directions';

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
    const room = Room.getById(character.roomId);
    return room.createDoor(dir).then(() => {
      character.output('Door created.');
      character.toRoom(`${character.name} waves his hand and a door appears to the ${dir.long}!`, [character.id]);
      return Promise.resolve();
    });
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
