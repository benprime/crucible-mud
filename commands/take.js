'use strict';

const roomManager = require('../roomManager');
const autocomplete = require('../autocomplete');

module.exports = {
  name: 'take',

  alias: [],

  patterns: [
    /^take\s+(.+)$/i,
    /^get\s+(.+)$/i,
    /^take/i,
    /^get/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      socket.emit('output', { message: 'What do you want to take?' });
    }
    module.exports.execute(socket, match[1]);
  },

  execute(socket, itemName) {

    // get any items offered to the user
    const item = autocomplete.autocomplete(socket, ['room'], itemName);

    if (!item) {
      socket.emit('output', { message: 'You don\'t see that here!' });
      return;
    }

    // fixed items cannot be taken, such as a sign.
    if (item.fixed) {
      socket.emit('output', { message: 'You cannot take that!' });
      return;
    }

    // take the item from the room
    const room = roomManager.getRoomById(socket.user.roomId);
    room.inventory.remove(item);
    room.save();

    // and give it to the user
    if (item.type === 'key') {
      socket.user.keys.push(item);
    } else {
      socket.user.inventory.push(item);
    }
    socket.user.save();

    socket.emit('output', { message: `${item.displayName} taken.` });
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} takes ${item.displayName}.` });

    /*
    // todo: RE-IMPLEMENT OFFERS
    // handle an item offered from another user
    const offerIndex = global.offers.findIndex(offer => offer.item.id === item.id);
    if(offerIndex !== -1) {
      let offer = global.offers[offerIndex];
      let userSocket = global.GetSocketByUsername(offer.fromUserName);
      if (!userSocket) {
        socket.emit('output', { message: 'Invalid username or user is offline.' });
        return;
      }
      // remove the offer from the list of offers
      global.offers.splice(offerIndex, 1);

      // remove the item from the other users' inventory
      const otherUserItemIndex = userSocket.user.inventory.findIndex(item => item.id === offer.item.id);
      userSocket.user.inventory.splice(otherUserItemIndex, 1);
      userSocket.emit('output', { message: `${item.displayName} was removed from your inventory.` });
      userSocket.user.save();
    }
    */
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    socket.emit('output', { message: output });
  },
};
