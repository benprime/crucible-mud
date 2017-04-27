'use strict';

const roomManager = require('../roomManager');
const Room = require('../models/room');

module.exports = {
  name: 'create',
  admin: true,

  patterns: [
    /^create\s+(room)\s+(\w+)$/i,
    /'^create\s+(item)\s+(.+)$'/i,
  ],

  dispatch(socket, match) {
    const type = match[1].toLowerCase();
    const param = match[2];
    module.exports.execute(socket, type, param);
  },

  execute(socket, type, param) {
    roomManager.getRoomById(socket.user.roomId, (room) => {
      console.log("create type: ", type);
      if(type === 'room') {
        const dir = param.toLowerCase();
        room.createRoom(dir, function() {
          socket.emit('output', { message: "Room created." });
          socket.broadcast.to(socket.user.roomId).emit("output", { message: `${socket.user.username} waves his hand and a door appears to the ${Room.exitName(dir)}!` });
        });
      } else {
        // todo: global error function for red text?
        console.log("Invalid create type");
        return;
      }

    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />';
    socket.emit('output', { message: output });
  },

};
