'use strict';

module.exports = {
  name: 'teleport',

  patterns: [
    /teleport\s+(\w+)$/i,
    /tele\s+(\w+)$/i
  ],

  /*
        if (socket.admin) {
          if (command.length < 2) {
            socket.emit('output', { message: 'Teleport to who?' });
            return;
          }
          Teleport(socket, command[1], () => {
            socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} appears out of thin air!` });
            Look(socket);
          });
        }
   */

  dispatch(socket, match) {
  },

  execute(socket, input) {
    const userSocket = globals.GetSocketByUsername(username);
    if (!userSocket) {
      socket.emit('output', { message: 'Player not found.' });
      return;
    }

    combat.Break(socket);
    socket.leave(socket.room._id);
    socket.join(userSocket.room._id);
    socket.room = userSocket.room;
    if (callback) callback();
  },

  help() {},

}
