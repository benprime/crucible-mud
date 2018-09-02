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
      this.help(socket.character);
      return Promise.resolve();
    }
    return this.execute(socket.character, match[1]);
  },

  execute(character, itemName) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      character.output('This command can only be used in a shop.');
      return Promise.reject();
    }

    return shop.getItemTypeByAutocomplete(itemName).then(itemType => {
      // check if user has money
      if (character.currency < itemType.price) {
        character.output('You cannot afford that.');
        return Promise.reject();
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
