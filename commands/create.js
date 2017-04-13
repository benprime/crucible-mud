'use strict';

const roomManager = require('../roomManager');



module.exports = {
  name: 'create',

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

      }
      else if(type === 'item') {
        const name = param;

            /*
        CreateItem(socket, item, callback) {
          // add to player's inventoryin mongo
          globals.DB.collection('users').update({ _id: socket.userId }, { $addToSet: { inventory: item } }, () => {
            // add item to player's current inventory
            socket.inventory.push(item);
            if (callback) callback();
          });
        },

      function CreateItem(socket, name, callback) {
      const item = {
        _id: new ObjectId(),
        name,
        desc: 'Default description.',
      };

      items.CreateItem(socket, item, () => {
        socket.emit('output', { message: 'Item added to inventory.' });
        socket.broadcast.to(socket.room._id).emit('output', { message: `${globals.USERNAMES[socket.id]} has created a ${name} out of thin air.` });
        if (callback) callback();
      });
      }

      */
      } else {
        // todo: global error function for red text?
        console.log("Invalid create type");
        return;
      }

    });
  },

  help() {},

}
