import Room from '../models/room';
import socketUtil from '../core/socketUtil';
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
    return this.execute(socket.character, match[1])
      .catch(error => socket.character.output(error));
  },

  execute(character, dir) {
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

    if (exit.locked) {
      return Promise.reject('That door is locked.');
    }

    if (exit.closed === false) {
      return Promise.reject('That door is already open.');
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
