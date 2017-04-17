'use strict';

const roomManager = require('../roomManager');

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
          console.log("it worked.");
        });
      } else {
        // todo: global error function for red text?
        console.log("Invalid create type");
        return;
      }

    });
  },

  help() {},

};
