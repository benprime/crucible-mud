import Room from '../models/room';
import Area from '../models/area';

export default {
  name: 'create',
  admin: true,

  patterns: [
    /^create\s+(room)\s+(\w+)$/i,
    /^create\s+(door)\s+(\w+)$/i,
    /^create\s+(area)\s+(.+)$/i,
    /^create\s+.*$/i,
  ],

  dispatch(socket, match) {
    if(match.length < 3) {
      this.help(socket);
      return;
    }
    const type = match[1].toLowerCase();
    const param = match[2];
    this.execute(socket, type, param);
  },

  execute(socket, type, param) {
    const room = Room.getById(socket.character.roomId);
    if (type === 'room') {
      const dir = Room.validDirectionInput(param.toLowerCase());
      if (!dir) {
        socket.emit('output', { message: 'Invalid direction!' });
        return;
      }
      room.createRoom(dir, (result) => {
        if(result) {
          socket.emit('output', { message: 'Room created.' });
          socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} waves his hand and an exit appears to the ${Room.shortToLong(dir)}!` });
        }
      });
    }

    else if (type === 'door') {
      const dir = Room.validDirectionInput(param);
      const exit = room.getExit(dir);

      if (!exit) {
        socket.emit('output', { message: 'Invalid direction.' });
        return;
      }

      if (exit.closed !== undefined) {
        socket.emit('output', { message: 'Door already exists.' });
        return;
      }

      exit.closed = true;
      room.save(err => { if (err) throw err; });
      socket.emit('output', { message: 'Door created.' });
    }

    else if (type === 'area') {
      let area = Area.getByName(param);
      if (area) {
        socket.emit('output', { message: `Area already exists: ${area.id}` });
        return;
      }
      Area.addArea(param);
      socket.emit('output', { message: 'Area created.' });
    }
    
    else {
      socket.emit('output', { message: 'Invalid create type.' });
      return;
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create door </span><span class="purple">-</span> Create new room in specified direction.<br />';
    output += '<span class="mediumOrchid">create area </span><span class="purple">-</span> Create new room in specified direction.<br />';
    socket.emit('output', { message: output });
  },

};
