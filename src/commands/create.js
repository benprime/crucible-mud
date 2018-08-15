import Room from '../models/room';

export default {
  name: 'create',
  admin: true,

  patterns: [
    /^create\s+(room)\s+(\w+)$/i,
    /^create\s+(door)\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    const type = match[1].toLowerCase();
    const param = match[2];
    this.execute(socket, type, param);
  },

  execute(socket, type, param) {
    const room = Room.getById(socket.user.roomId);
    if (type === 'room') {
      const dir = Room.validDirectionInput(param.toLowerCase());
      if (!dir) {
        socket.emit('output', { message: 'Invalid direction!' });
        return;
      }
      room.createRoom(dir, () => {
        socket.emit('output', { message: 'Room created.' });
        socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} waves his hand and an exit appears to the ${Room.shortToLong(dir)}!` });
      });
    }
    else if (type === 'door') {
      const dir = Room.validDirectionInput(param);
      const exit = room.getExit(dir);

      if (exit) {
        exit.closed = true;
        room.save(err => { if (err) throw err; });
      } else {
        socket.emit('output', { message: 'Invalid direction.' });
        return;
      }
    } else {
      socket.emit('output', { message: 'Invalid create type.' });
      return;
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    socket.emit('output', { message: output });
  },

};
