import Room from '../models/room';
import commandCategories from '../core/commandCategories';
import { getDirection } from '../core/directions';

export default {
  name: 'open',
  desc: 'open a door',
  category: commandCategories.door,

  patterns: [
    /^open\s+(\w+)$/i,
    /^op\s+(\w+)$/i,
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
    return room.openDoor(dir).then(() => {
      character.output('Door opened.');
      character.toRoom(`${character.name} opens the door to the ${dir.long}.`, [character.id]);
      return Promise.resolve();
    });
  },

  help(character) {
    const output = '<span class="mediumOrchid">open &lt;direction&gt; </span><span class="purple">-</span> Open a door in the given direction.<br />';
    character.output(output);
  },
};
