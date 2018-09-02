import socketUtil from '../core/socketUtil';
import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'close',
  desc: 'close a door',
  category: commandCategories.door,

  patterns: [
    /^close\s+(\w+)$/i,
    /^cl\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1])
      .catch(error => socket.character.output(error));
  },

  execute(character, dir) {

    // changes "north" to "n" (just returns "n" if that's what's passed in)
    const d = Room.validDirectionInput(dir.toLowerCase());
    const room = Room.getById(character.roomId);

    // valid exit in that direction?
    const exit = room.exits.find(e => e.dir === d);
    if (!exit) {
      return Promise.reject('There is no exit in that direction!');
    }

    if (exit.closed === undefined) {
      return Promise.reject('There is no door in that direction!');
    }

    exit.closed = true;

    character.output('Door closed.');
    character.toRoom(`${character.name} closes the door to the ${Room.shortToLong(d)}.`, [character.id]);
    return Promise.resolve();
  },

  help(character) {
    const output = '<span class="mediumOrchid">close &lt;direction&gt; </span><span class="purple">-</span> Close a door in the given direction.<br />';
    character.output(output);
  },
};
