import Shop from '../../../models/shop';
import itemData from '../../../data/itemData';

export default {
  name: 'stock',
  execute(character, name, count) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      character.output('This command can only be used in a shop.');
      return false;
    }

    // this does not yet use autocomplate, because catalog data will be moved to the database
    const createType = itemData.catalog.find(item => item.name.toLowerCase() === name.toLowerCase() && item.type === 'item');
    if (!createType) {
      character.output('Unknown item type.');
      return false;
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
      return true;
    });
  },
};
