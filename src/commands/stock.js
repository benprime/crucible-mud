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

    this.execute(socket, match[1], match[2]);
  },

  execute(socket, name, count) {

    const shop = Shop.getById(socket.character.roomId);
    if (!shop) {
      socket.emit('output', { message: 'This command can only be used in a shop.' });
      return;
    }

    const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
    if (!createType) {
      socket.emit('output', { message: 'Unknown item type.' });
      return;
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
      socket.emit('output', { message: 'Items created and added to shop.' });
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">stock </span><span class="purple">-</span> Creates items to stock stores with.<br />';
    socket.emit('output', { message: output });
  },
};
