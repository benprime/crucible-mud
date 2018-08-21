import Shop from '../models/shop';
import itemData from '../data/itemData';

export default {
  name: 'stock',
  admin: true,

  patterns: [
    /^stock\s+(\w+)\s+(\d+)$/i,
    /^stock\s.*$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 3) {
      this.help(socket);
      return;
    }

    this.execute(socket.character, match[1], match[2]);
  },

  execute(character, name, count) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      return Promise.reject('This command can only be used in a shop.');
    }

    const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
    if (!createType) {
      return Promise.reject('Unknown item type.');
    }

    // see if the shop already carries this item
    const stockType = shop.stock.find(st => st.itemName === createType.name);
    if (stockType) {
      stockType.quantity = count;
    } else {
      shop.stock.push({
        itemTypeName: createType.name,
        quantity: count,
      });
    }

    shop.save((err) => {
      if (err) throw err;
      return Promise.resolve('Items created and added to shop.');
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">stock </span><span class="purple">-</span> Creates items to stock stores with.<br />';
    socket.emit('output', { message: output });
  },
};
