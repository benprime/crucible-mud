'use strict';

const Room = require('../models/room');
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
    function saveItem(item) {
      // and give it to the user
      if (item.type === 'key') {
        socket.user.keys.push(roomItem);
      } else {
        socket.user.inventory.push(roomItem);
      }
      socket.user.save();
    }

    // get any items offered to the user
    const offerIndex = socket.offers.findIndex(o => o.item.id === roomItem.id);
    
    // handle an item offered from another user
    if (offerIndex !== -1) {
      let offer = socket.offers[offerIndex];
      let offeringUserSocket = global.GetSocketByUsername(offer.fromUserName);
      if (!offeringUserSocket) {
        socket.emit('output', { message: 'Invalid username or user is offline.' });
        return;
      }

      saveItem(offer.item);

      // remove the offer from the list of offers
      socket.offers.splice(offerIndex, 1);

      // remove the item from the other users' inventory
      const otherUserItemIndex = offeringUserSocket.user.inventory.findIndex(item => item.id === offer.item.id);
      offeringUserSocket.user.inventory.splice(otherUserItemIndex, 1);
      offeringUserSocket.emit('output', { message: `${roomItem.displayName} was removed from your inventory.` });
      offeringUserSocket.user.save();
      return;
    }

    const roomItem = autocomplete.autocomplete(socket, ['room'], itemName);
    if (roomItem) {
      // fixed items cannot be taken, such as a sign.
      if (roomItem.fixed) {
        socket.emit('output', { message: 'You cannot take that!' });
        return;
      }
      // take the item from the room
      const room = Room.getById(socket.user.roomId);
      room.inventory.remove(roomItem);

      saveItem(roomItem);
      room.save();

      socket.emit('output', { message: `${roomItem.displayName} taken.` });
      socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} takes ${roomItem.displayName}.` });
      return;
    }

    socket.emit('output', { message: 'You don\'t see that here!' });
    return;
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    socket.emit('output', { message: output });
  },
};
