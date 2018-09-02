import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'open',
  desc: 'open a door',
  category: commandCategories.door,

  patterns: [
    /^open\s+(\w+)$/i,
    /^op\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    return this.execute(socket.character, match[1]);
  },

  execute(character, dir) {
    const d = Room.validDirectionInput(dir.toLowerCase());
    const room = Room.getById(character.roomId);

    // valid exit in that direction?
    const exit = room.exits.find(e => e.dir === d);
    if (!exit) {
      character.output('There is no exit in that direction!');
      return Promise.reject();
    }

    if (exit.closed === undefined) {
      character.output('There is no door in that direction!');
      return Promise.reject();
    }

    if (exit.locked) {
      character.output('That door is locked.');
      return Promise.reject();
    }

    if (exit.closed === false) {
      character.output('That door is already open.');
      return Promise.reject();
    }

    exit.closed = false;

    character.output('Door opened.');
    character.toRoom(`${character.name} opens the door to the ${Room.shortToLong(d)}.`, [character.id]);
    return Promise.resolve();
  },

  help(character) {
    const output = '<span class="mediumOrchid">open &lt;direction&gt; </span><span class="purple">-</span> Open a door in the given direction.<br />';
    character.output(output);
  },
};
