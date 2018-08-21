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
    this.execute(socket.character, match[1]);
  },

  execute(character, itemName) {

    // check if user has item
    const acResult = autocomplete.autocompleteTypes(character, ['inventory'], itemName);
    if (!acResult) {
      return Promise.reject('You don\'t seem to be carrying that.');
    }

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      return Promise.reject('This command can only be used in a shop.');
    }

    const itemType = shop.getItemTypeByAutocomplete(itemName);

    // check if shop carries this type of item
    const stockType = shop.stock.find(st => st.itemTypeName === itemType.name);
    if (!stockType) {
      return Promise.reject('This shop does not deal in those types of items.');
    }

    // check if item can be sold
    if (!itemType.price) {
      return Promise.reject('You cannot sell this item.');
    }

    const sellPrice = shop.getSellPrice(itemType);

    // check if shop has money
    if (shop.currency < sellPrice) {
      return Promise.reject('The shop cannot afford to buy that from you.');
    }

    shop.sell(character, itemType);
    if (sellPrice) {
      return Promise.resolve({
        charMessages: [
          { charId: character.id, message: `You sold ${itemType.displayName} for ${sellPrice}.` },
        ],
        roomMessages: [
          // todo: is item type enough here? There may be adjectives on items
          { roomId: character.roomId, message: `${character.name} sells ${itemType.displayName} to the shop.` },
        ],
      });
    }
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">sell &lt;item name&gt </span><span class="purple">-</span> sell an item to a shop. <br />';
    socket.emit('output', { message: output });
  },
};
