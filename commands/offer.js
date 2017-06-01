
const roomManager = require('../roomManager');

module.exports = {
  name: 'offer',

  patterns: [
    /^offer\s+(\w+)\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    module.exports.execute(socket, match[1], match[2]);
  },

  execute(socket, userName, itemName) {
    userName = userName.toLowerCase();
    const room = roomManager.getRoomById(socket.user.roomId);
    itemName = itemName.toLowerCase();
    const itemNames = socket.user.inventory.map(item => item.displayName);
    const itemNamesCompleted = global.AutocompleteName(socket, itemName, itemNames);

    if (itemNamesCompleted.indexOf(itemName) == -1) {
      socket.emit('output', { message: `${itemName} is not in your inventory!` });
      return;
    }

    const userNames = global.UsersInRoom(socket.user.roomId)
      .filter(name => name !== socket.user.username)
      .map(name => name.toLowerCase());

    const userNamesCompleted = global.AutocompleteName(socket, userName, userNames);
    if (userNames.indexOf(userName) == -1) {
      socket.emit('output', { message: `${userName} is not here!` });
      return;
    }

    const userItem = socket.user.inventory.find(item => item.displayName == itemName);
    const existingOfferIndex = global.offers.findIndex(offer => offer.itemId == userItem.id);
    const offer = {
      fromUserName: socket.user.username,
      toUserName: userName,
      item: userItem,
    }

    if (existingOfferIndex !== -1) {
      global.offers[existingOfferIndex] = offer;
    } else {
      global.offers.push(offer);
    }

    setTimeout(() => {
      let itemIndex = global.offers.findIndex(offer => offer.item.id === userItem.id)
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