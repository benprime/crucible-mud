import Room from '../models/room';
import commandCategories from '../core/commandCategories';
import { getDirection } from '../core/directions';

export default {
  name: 'close',
  desc: 'close a door',
  category: commandCategories.door,

  patterns: [
    /^close\s+(\w+)$/i,
    /^cl\s+(\w+)$/i,
  ],

  parseParams(character, match) {
    const dir = getDirection(match[1]);
    return [character, dir];
  },

  dispatch(socket, match) {
    const params = this.parseParams(socket.character, match);
    return this.execute.apply(this, params);
  },

  execute(character, dir) {
    const room = Room.getById(character.roomId);

    return room.closeDoor(dir).then(() => {
      character.output('Door closed.');
      character.toRoom(`${character.name} closes the door to the ${dir.long}.`, [character.id]);
      return Promise.resolve();
    });
  },

  help(character) {
    const output = '<span class="mediumOrchid">close &lt;direction&gt; </span><span class="purple">-</span> Close a door in the given direction.<br />';
    character.output(output);
  },
};
