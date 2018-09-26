import Shop from '../../../models/shop';
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'sell',
  execute(character, itemName) {

    // check if user has item
    const acResult = autocomplete.multiple(character, ['inventory'], itemName);
    if (!acResult) {
      character.output('You don\'t seem to be carrying that.');
      return Promise.reject();
    }

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      character.output('This command can only be used in a shop.');
      return Promise.reject();
    }

    const itemType = shop.getItemTypeByAutocomplete(itemName);

    // check if shop carries this type of item
    const stockType = shop.stock.find(st => st.itemTypeName === itemType.name);
    if (!stockType) {
      character.output('This shop does not deal in those types of items.');
      return Promise.reject();
    }

    // check if item can be sold
    if (!itemType.price) {
      character.output('You cannot sell this item.');
      return Promise.reject();
    }

    const sellPrice = shop.getSellPrice(itemType);

    // check if shop has money
    if (shop.currency < sellPrice) {
      character.output('The shop cannot afford to buy that from you.');
      return Promise.reject();
    }

    shop.sell(character, itemType);
    if (sellPrice) {
      character.output(`You sold ${itemType.name} for ${sellPrice}.`);
      // todo: is item type enough here? There may be adjectives on items
      character.toRoom(`${character.name} sells ${itemType.name} to the shop.`, [character.id]);
    }
    return Promise.resolve();
  },
};
