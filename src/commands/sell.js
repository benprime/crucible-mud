import Shop from '../models/shop';
import autocomplete from '../core/autocomplete';

export default {
  name: 'sell',

  patterns: [
    /^sell\s+(.+)$/i,
    /^sell\s.*/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      this.help(socket);
    }
    this.execute(socket, match[1]);
  },

  execute(socket, itemName) {

    // check if user has item
    const acResult = autocomplete.autocompleteTypes(socket, ['inventory'], itemName);
    if (!acResult) {
      return;
    }

    const shop = Shop.getById(socket.character.roomId);
    if (!shop) {
      socket.emit('output', { message: 'This command can only be used in a shop.' });
      return;
    }

    const itemType = shop.getItemTypeByAutocomplete(itemName);

    // check if shop carries this type of item
    const stockType = shop.stock.find(st => st.itemTypeName === itemType.name);
    if (!stockType) {
      socket.emit('output', { message: 'This shop does not deal in those types of items.' });
      return;
    }

    // check if item can be sold
    if (!itemType.price) {
      socket.emit('output', { message: 'You cannot sell this item.' });
      return;
    }

    const sellPrice = shop.getSellPrice(itemType);

    // check if shop has money
    if (shop.currency < sellPrice) {
      socket.emit('output', { message: 'The shop cannot afford to buy that from you.' });
      return;
    }

    shop.sell(socket.character, itemType);
    if (sellPrice) {
      socket.emit('output', { message: `You sold ${itemType.displayName} for ${sellPrice}.` });
      socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} sells ${itemType.displayName} to the shop.` });
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">sell &lt;item name&gt </span><span class="purple">-</span> sell an item to a shop. <br />';
    socket.emit('output', { message: output });
  },
};
