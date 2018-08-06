import Room from '../models/room';

export default {
  name: 'close',

  patterns: [
    /^close\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1]);
  },

  execute(socket, dir) {

    // changes "north" to "n" (just returns "n" if that's what's passed in)
    const d = Room.validDirectionInput(dir.toLowerCase());
    const room = Room.getById(socket.user.roomId);

    // valid exit in that direction?
    const exit = room.exits.find(e => e.dir === d);
    if (!exit) {
      socket.emit('output', { message: 'There is no exit in that direction!' });
      return;
    }

    if (!exit.hasOwnProperty('closed')) {
      socket.emit('output', { message: 'There is no door in that direction!' });
      return;
    }

    exit.closed = true;
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} closes the door to the ${Room.shortToLong(d)}.` });
    socket.emit('output', { message: 'Door closed.' });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">close &lt;direction&gt; </span><span class="purple">-</span> Close a door in the given direction.<br />';
    socket.emit('output', { message: output });
  },
};
