import socketUtil from '../core/socketUtil';
import Shop from '../models/shop';
import commandCategories from '../core/commandCategories';

export default {
  name: 'buy',
  desc: 'buy item from a shop',
  category: commandCategories.shop,

  patterns: [
    /^buy\s+(.+)$/i,
    /^buy\s.*/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      return this.help(socket.character);
    }
    return this.execute(socket.character, match[1])
      .catch(error => socket.character.output(error));
  },

  execute(character, itemName) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      return Promise.reject('This command can only be used in a shop.');
    }

    return shop.getItemTypeByAutocomplete(itemName).then(itemType => {
      // check if user has money
      if (character.currency < itemType.price) {
        return Promise.reject('You cannot afford that.');
      }

      const item = shop.buy(character, itemType);
      if (item) {
        character.output('Item purchased.');
        character.toRoom(`${character.name} buys ${item.name} from the shop.`, [character.id]);

        return Promise.resolve();
      }
    });
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">buy &lt;item name&gt </span><span class="purple">-</span> Buy an item from a shop. <br />';
    character.output(output);
  },
};
