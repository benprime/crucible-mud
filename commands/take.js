'use strict';

const roomManager = require('../roomManager');

module.exports = {
  name: 'take',

  alias: [],

  patterns: [
    /^take\s+(.+)$/i,
    /^get\s+(.+)$/i,
    /^take/i,
    /^get/i
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      socket.emit('output', { message: 'What do you want to take?' });
    }
    module.exports.execute(socket, match[1]);
  },

  execute(socket, itemName) {
    const room = roomManager.getRoomById(socket.user.roomId);

    // get any items offered to the user
    const offerItems = global.offers
      .filter(offer => offer.toUserName.toLowerCase() === socket.user.username.toLowerCase())
      .map(offer => offer.item);

    // combine the offered items with the items in the room
    const items = room.inventory.concat(offerItems);
    
    // autocomplete names
    const itemNames = items.map(item => item.displayName);
    const completedNames = global.AutocompleteName(socket, itemName, itemNames);
    if (completedNames.length === 0) {
      socket.emit('output', { message: 'You don\'t see that item here.' });
      return;
    } else if (completedNames.length > 1) {
      // todo: possibly print out a list of the matches
      socket.emit('output', { message: 'Not specific enough!' });
      return;
    }

    const item = items.find(item => item.displayName === completedNames[0]);

    // todo: are we calling it 'fixed' for non-takeable items like signs and stuff?
    if (item.fixed) {
      socket.emit('output', { message: 'You cannot take that!' });
      return;
    }

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
    } else { // handle an item from the room
      // remove the item from the room
      const index = room.inventory.indexOf(item);
      room.inventory.splice(index, 1);
      room.save();
    }

    // and give it to the user
    socket.user.inventory.push(item);
    socket.user.save();

    socket.emit('output', { message: `${item.displayName} taken.` });
    socket.broadcast.to(socket.user.roomId).emit('output', { message: `${socket.user.username} takes ${item.displayName}.` });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    socket.emit('output', { message: output });
  },
};
