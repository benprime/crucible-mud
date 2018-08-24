import Room from '../models/room';
import socketUtil from '../core/socketUtil';

export default {
  name: 'open',

  patterns: [
    /^open\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
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

    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: 'Door opened.' },
      ],
      roomMessages: [
        { roomId: character.roomId, message: `${character.name} opens the door to the ${Room.shortToLong(d)}.`, exclude: [character.id] },
      ],
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">open &lt;direction&gt; </span><span class="purple">-</span> Open a door in the given direction.<br />';
    socket.emit('output', { message: output });
  },
};
