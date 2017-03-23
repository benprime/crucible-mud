'use strict';

module.exports = {
  name: "take",

  alias: [],

  patterns: [
    /^take\s+?(\w+)/i
  ],

  dispatch(socket, match) {
  },

  execute(socket, match) {

    const itemName = match[1];

    const item = socket.room.inventory.GetFirstByName(itemName);
    if (!item) {
      socket.emit('output', { message: "You don't see that item here." });
      return;
    }

    if (item.fixed) {
      socket.emit('output', { message: 'You cannot take that!' });
      return;
    }

    // todo:
    // remove from room
    // add to user inventory
    // 
    socket.emit('output', { message: 'Taken.' });
    socket.broadcast.to(socket.room._id).emit('output', { message: `${socket.user.username} takes ${item.name}.` });
  },

  help() {},
}
