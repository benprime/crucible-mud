import Shop from '../models/shop';

export default {
  name: 'buy',

  patterns: [
    /^buy\s+(.+)$/i,
    /^buy\s.*/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      this.help(socket);
    }
    this.execute(socket, match[1]);
  },

  execute(socket, itemName) {

    const shop = Shop.getById(socket.character.roomId);
    if (!shop) {
      socket.emit('output', { message: 'This command can only be used in a shop.' });
      return;
    }

    const itemType = shop.getItemTypeByAutocomplete(itemName);
    if(!itemType) {
      socket.emit('output', { message: 'This shop does not deal in those types of items.' });
      return;
    }

    // check if user has money
    if (socket.character.currency < itemType.price) {
      socket.emit('output', { message: 'You cannot afford that.' });
      return;
    }

    const item = shop.buy(socket.character, itemType);
    if (item) {
      socket.emit('output', { message: 'Item purchased.' });
      socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} buys ${item.displayName} from the shop.` });
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">buy &lt;item name&gt </span><span class="purple">-</span> Buy an item from a shop. <br />';
    socket.emit('output', { message: output });
  },
};
