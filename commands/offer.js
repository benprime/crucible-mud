'use strict';

const Room = require('../models/room');
const socketUtil = require('../socketUtil');
const autocomplete = require('../autocomplete');

module.exports = {
  name: 'offer',

  patterns: [
    /^offer\s+(\w+)\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, userName, itemName) {
    const room = Room.getById(socket.user.roomId);
    const item = autocomplete.autocompleteTypes(socket, ['inventory'], itemName);

    if(!item || item.length === 0) {
      return;
    }

    const userNames = room.usersInRoom()
      .filter(name => name !== socket.user.username && name.toLowerCase() === userName.toLowerCase());

    if (userNames.length == 0) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    } else if (userNames.length > 1) {
      socket.emit('output', { message: `'${userName}' is a common name here. Be more specific.` });
      return;
    } else {
      userName = userNames[0];
    }

    const userItemIndex = socket.user.inventory.findIndex(i => i.id === item.id);
    const offer = {
      fromUserName: socket.user.username,
      toUserName: userName,
      item: socket.user.inventory[userItemIndex],
    };

    let toUserSocket = socketUtil.getSocketByUsername(userName);
    if (!toUserSocket) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    }

    let existingOfferIndex;

    if(!toUserSocket.offers || toUserSocket.offers.length < 1) {
      toUserSocket.offers = [ offer ];
    } else {
      existingOfferIndex = toUserSocket.offers.findIndex(o => o.item.id === offer.item.id);
      if (existingOfferIndex !== -1) {
        toUserSocket.offers[existingOfferIndex] = offer;
      } else {
        toUserSocket.offers.push(offer);
      }
    }

    setTimeout(() => {
      let itemIndex = toUserSocket.offers.findIndex(o => o.item.id === item.id);
      if (itemIndex !== -1) {
        toUserSocket.offers.splice(itemIndex, 1);
      }
    }, 60000);

    toUserSocket.emit('output', { message: `${socket.user.username} offered you a ${itemName}.` });
    socket.emit('output', { message: `You offered a ${itemName} to ${userName}.` });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">offer &lt;item&gt; &lt;player&gt; </span><span class="purple">-</span> Offer an item to a player.<br />';
    socket.emit('output', { message: output });
  },
};
