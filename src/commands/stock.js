import Shop from '../models/shop';
import itemData from '../data/itemData';
import commandCategories from '../core/commandCategories';

export default {
  name: 'stock',
  desc: 'add item types to an existing shop',
  category: commandCategories.shop,
  admin: true,

  patterns: [
    /^stock\s+(.+)\s+(\d+)$/i,
    /^stock\s.*$/i,
    /^stock$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 3) {
      this.help(socket.character);
      return Promise.resolve();
    }

    return this.execute(socket.character, match[1], match[2]);
  },

  execute(character, name, count) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      character.output('This command can only be used in a shop.');
      return Promise.reject();
    }

    // this does not yet use autocomplate, because catalog data will be moved to the database
    const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
    if (!createType) {
      character.output('Unknown item type.');
      return Promise.reject();
    }

    // see if the shop already carries this item
    const stockType = shop.stock.find(st => st.itemTypeName === createType.name);
    if (stockType) {
      stockType.quantity = count;
    } else {
      shop.stock.push({
        itemTypeName: createType.name,
        quantity: count,
      });
    }

    return shop.save((err) => {
      if (err) throw err;
    }).then(() => {
      character.output('Items created and added to shop.');
      return Promise.resolve();
    });
  },

  help(character) {
    const output = '<span class="mediumOrchid">stock &lt;item type&gt; &lt;quantity&gt;</span><span class="purple">-</span> Creates items to stock stores with.<br />';
    character.output(output);
  },
};
