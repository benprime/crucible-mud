import Room from '../models/room';
import commandCategories from '../core/commandCategories';
import { Direction, getDirection } from '../core/directions';

export default {
  name: 'create room',
  desc: 'creates an adjacent room',
  category: commandCategories.world,
  admin: true,

  patterns: [
    /^create\s+(room)\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    const dir = getDirection(match[2]);
    return this.execute(socket.character, dir);
  },

  execute(character, dir) {
    if (!(dir instanceof Direction)) {
      character.output('Invalid direction!');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);

    return room.createRoom(dir).then(() => {
      character.output('Room created.');
      character.toRoom(`${character.name} waves his hand and an exit appears to the ${dir.long}!`, [character.id]);
      return Promise.resolve();
    });

  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    character.output(output);
  },

};
