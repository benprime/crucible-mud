import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';
import socketUtil from '../core/socketUtil';
import commandCategories from '../core/commandCategories';

export default {
  name: 'take',
  desc: 'take an item',
  category: commandCategories.item,

  patterns: [
    /^take\s+(.+)$/i,
    /^get\s+(.+)$/i,
    /^take/i,
    /^get/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      return Promise.reject('What do you want to take?');
    }
    return this.execute(socket.character, match[1], socket.user.admin)
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, itemName, admin) {
    function saveItem(item) {
      // and give it to the user
      if (item.type === 'key') {
        character.keys.push(item);
      } else {
        character.inventory.push(item);
      }
      character.save(err => { if (err) throw err; });
    }

    const acResult = autocomplete.multiple(character, ['room'], itemName);
    if (acResult) {
      const roomItem = acResult.item;

      // fixed items cannot be taken, such as a sign.
      if (roomItem.fixed) {
        return Promise.reject('You cannot take that!');
      }
      if (roomItem.hidden && !admin) {
        //ignore players from unknowingly grabbing a hidden item
        return Promise.reject('You don\'t see that here!');
      }
      // take the item from the room
      const room = Room.getById(character.roomId);
      utils.removeItem(room.inventory, roomItem);

      saveItem(roomItem);
      room.save(err => { if (err) throw err; });

      character.output(`${roomItem.name} taken.`);
      character.toRoom(`${character.name} takes ${roomItem.name}.`, [character.id]);
      return Promise.resolve();
    }

    return Promise.reject('You don\'t see that here!');
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    character.output(output);
  },
};
