import Shop from '../../../models/shop';

export default {
  name: 'buy',
  execute(character, itemName) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      character.output('This command can only be used in a shop.');
      return false;
    }

    const itemType = shop.getItemTypeByAutocomplete(character, itemName);
    if (!itemType) {
      character.output('Unknown item type.');
      return false;
    }

    // check if user has money
    if (character.currency < itemType.price) {
      character.output('You cannot afford that.');
      return false;
    }

    const item = shop.buy(character, itemType);
    if (item) {
      character.output('Item purchased.');
      character.toRoom(`${character.name} buys ${item.name} from the shop.`, [character.id]);

      return true;
    }
  },
};
