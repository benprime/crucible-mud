'use strict';

const Room = require('../models/room');

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
    //todo: probably a bad pratice to change parameters directly. Make a copy.
    userName = userName.toLowerCase();
    itemName = itemName.toLowerCase();
    const itemNames = socket.user.inventory.map(item => item.displayName);
    const itemNamesCompleted = global.AutocompleteName(socket, itemName, itemNames);

    if (itemNamesCompleted.length == 0) {
      socket.emit('output', { message: `${itemName} is not in your inventory!` });
      return;
    } else if (itemNamesCompleted.length > 1) {
      socket.emit('output', { message: `Many items can be described as '${itemName}'. Be more specific.` });
      return;
    } else {
      itemName = itemNamesCompleted[0];
    }

    const userNames = room.UsersInRoom()
      .filter(name => name !== socket.user.username);

    const userNamesCompleted = global.AutocompleteName(socket, userName, userNames);
    if (userNamesCompleted.length == 0) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    } else if (userNamesCompleted.length > 1) {
      socket.emit('output', { message: `${userName} is a common name here. Be more specific.` });
      return;
    } else {
      userName = userNamesCompleted[0];
    }

    const userItem = socket.user.inventory.find(item => item.displayName == itemName);
    const existingOfferIndex = global.offers.findIndex(offer => offer.itemId == userItem.id);
    const offer = {
      fromUserName: socket.user.username,
      toUserName: userName,
      item: userItem,
    };

    if (existingOfferIndex !== -1) {
      global.offers[existingOfferIndex] = offer;
    } else {
      global.offers.push(offer);
    }

    setTimeout(() => {
      let itemIndex = global.offers.findIndex(offer => offer.item.id === userItem.id);
      if (itemIndex !== -1) {
        global.offers.splice(itemIndex, 1);
      }
    }, 60000);

    const userSocket = global.GetSocketByUsername(userName);
    if (!userSocket) {
      socket.emit('output', { message: 'Invalid username.' });
      return;
    }

    userSocket.emit('output', { message: `${socket.user.username} offered you a ${itemName}.` });
    socket.emit('output', { message: `You offered a ${itemName} to ${userName}.` });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">offer &lt;item&gt; &lt;player&gt; </span><span class="purple">-</span> Offer an item to a player.<br />';
    socket.emit('output', { message: output });
  },
};