import Shop from '../models/shop';
import itemData from '../data/itemData';
import AsciiTable from 'ascii-table';

export default {
  name: 'list',

  patterns: [
    /^list$/i,
  ],

  dispatch(socket) {
    this.execute(socket.character)
      .then(output => socket.emit('output', { message: output, pre: true }));

  },

  execute(character) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      return Promise.reject('This command can only be used in a shop.');
    }

    if (!shop.stock || shop.stock.length === 0) {
      return Promise.reject('This shop currently has no items.');
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

    return Promise.resolve(`<pre>${table.toString()}</pre>`);
  },

  help(socket) {
    const output = '<span class="mediumOrchid">list </span><span class="purple">-</span> List store inventory.<br />';
    socket.emit('output', { message: output });
  },
};
