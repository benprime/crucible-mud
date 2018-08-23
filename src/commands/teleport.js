import socketUtil from '../core/socketUtil';
import breakCmd from './break';
import lookCmd from './look';
import Room from '../models/room';

export default {
  name: 'teleport',
  admin: true,

  patterns: [
    /^teleport\s+(\w+)$/i,
    /^tele\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1]);
  },

  execute(socket, teleportTo) {
    if(!teleportTo) return;
    // if the parameter is an object id or alias, we are definitely teleporting to a room.
    
    
    
    let toRoomId = '';
    if (Room.roomCache[teleportTo]) {
      toRoomId = teleportTo;
    } else {
      // otherwise, we are teleporting to a user
      const userSocket = socketUtil.getSocketByUsername(teleportTo);
      if (!userSocket) {
        socket.emit('output', { message: 'Target not found.' });
        return;
      }
      toRoomId = userSocket.character.roomId;
    }

    const room = Room.getById(toRoomId);
    if (!room) {
      // this should not currently be possible. The room cache has
      // already been checkedin this method.
      socket.emit('output', { message: 'Room not found.' });
      return;
    }
    breakCmd.execute(socket);

    socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} vanishes!` });
    socket.leave(socket.character.roomId);
    socket.join(room.id);
    socket.character.roomId = room.id;
    socket.character.save(err => { if (err) throw err; });

    socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} appears out of thin air!` });
    lookCmd.execute(socket);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">teleport &lt;room ID&gt;</span><span class="purple">-</span> Teleport to &lt;room&gt;.<br />';
    output += '<span class="mediumOrchid">teleport &lt;username&gt;</span><span class="purple">-</span> Teleport to &lt;player&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
