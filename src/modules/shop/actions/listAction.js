import Shop from '../../../models/shop';
import itemData from '../../../data/itemData';
import AsciiTable from 'ascii-table';

export default {
  name: 'list',
  execute(character) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      character.output('This command can only be used in a shop.');
      return Promise.reject();
    }

    if (!shop.stock || shop.stock.length === 0) {
      character.output('This shop currently has no items.');
      return Promise.reject();
    }

    const stockTypes = shop.stock.map(s => {
      const itemType = itemData.catalog.find(
        item => item.name.toLowerCase() === s.itemTypeName.toLowerCase()
          && item.type === 'item');
      return Object.assign(s, { itemType: itemType });
    });

    // todo: add color to this table. We will need to replace ascii-table.
    const table = new AsciiTable();
    table.setHeading('price', 'name', 'desc', 'quantity');
    stockTypes.forEach(st => table.addRow(st.itemType.price, st.itemType.name, st.itemType.desc, st.quantity));

    character.output(`<pre>${table.toString()}</pre>`, { pre: true });
    return Promise.resolve();
  },
};
