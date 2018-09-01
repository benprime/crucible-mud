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
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
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

    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: 'Door closed.' },
      ],
      roomMessages: [
        { roomId: character.roomId, message: `${character.name} closes the door to the ${Room.shortToLong(d)}.`, exclude: [character.id]},
      ],
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">close &lt;direction&gt; </span><span class="purple">-</span> Close a door in the given direction.<br />';
    socket.emit('output', { message: output });
  },
};
