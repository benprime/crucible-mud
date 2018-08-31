import socketUtil from '../core/socketUtil';
import Shop from '../models/shop';
import { commandCategories } from '../core/commandManager';

export default {
  name: 'buy',
  desc: 'buy item from a shop',
  category: commandCategories.shop,

  patterns: [
    /^buy\s+(.+)$/i,
    /^buy\s.*/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      this.help(socket);
    }
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, itemName) {

    const shop = Shop.getById(character.roomId);
    if (!shop) {
      return Promise.reject('This command can only be used in a shop.');
    }

    return shop.getItemTypeByAutocomplete(itemName).then(itemType => {
      // check if user has money
      if (character.currency < itemType.price) {
        return Promise.reject('You cannot afford that.');
      }

      const item = shop.buy(character, itemType);
      if (item) {
        return Promise.resolve({
          charMessages: [
            { charId: character.id, message: 'Item purchased.' },
          ],
          roomMessages: [
            { roomId: character.roomId, message: `${character.name} buys ${item.name} from the shop.`, exclude: [character.id] },
          ],
        });
      }
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">buy &lt;item name&gt </span><span class="purple">-</span> Buy an item from a shop. <br />';
    socket.emit('output', { message: output });
  },
};
