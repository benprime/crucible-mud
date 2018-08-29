import Shop from '../models/shop';
import itemData from '../data/itemData';
import socketUtil from '../core/socketUtil';

export default {
  name: 'stock',
  admin: true,

  patterns: [
    /^stock\s+(.+)\s+(\d+)$/i,
    /^stock\s.*$/i,
    /^stock$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 3) {
      this.help(socket);
      return;
    }

    this.execute(socket.character, match[1], match[2])
      .then(response => socketUtil.output(socket, response))
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, name, count) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      return Promise.reject('This command can only be used in a shop.');
    }

    // this does not yet use autocomplate, because catalog data will be moved to the database
    const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
    if (!createType) {
      return Promise.reject('Unknown item type.');
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
      return Promise.resolve('Items created and added to shop.');
    });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">stock &lt;item type&gt; &lt;quantity&gt;</span><span class="purple">-</span> Creates items to stock stores with.<br />';
    socket.emit('output', { message: output });
  },
};
