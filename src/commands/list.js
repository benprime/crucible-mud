import Shop from '../models/shop';
import itemData from '../data/itemData';
import AsciiTable from 'ascii-table';

export default {
  name: 'list',

  patterns: [
    /^list$/i,
  ],

  dispatch(socket) {
    this.execute(socket);
  },

  execute(socket) {

    const shop = Shop.getById(socket.character.roomId);
    if (!shop) {
      socket.emit('output', { message: 'This command can only be used in a shop.' });
      return;
    }

    if (!shop.stock || shop.stock.length === 0) {
      socket.emit('output', { message: 'This shop currently has no items.' });
      return;
    }

    const stockTypes = shop.stock.map(s => {
      const itemType = itemData.catalog.find(
        item => item.name.toLowerCase() === s.itemTypeName.toLowerCase()
          && item.type === 'item');
      return Object.assign(s, { itemType: itemType });
    });

    const table = new AsciiTable();
    table.setHeading('price', 'name', 'desc', 'quantity');
    stockTypes.forEach(st => table.addRow(st.itemType.price, st.itemType.displayName, st.itemType.desc, st.quantity));
    socket.emit('output', { message: `<pre>${table.toString()}</pre>`, pre: true });
  },

  help(socket) {
    const output = '<span class="mediumOrchid">list </span><span class="purple">-</span> List store inventory.<br />';
    socket.emit('output', { message: output });
  },
};
