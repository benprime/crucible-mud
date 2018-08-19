import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import utils from '../core/utilities';

export default {
  name: 'take',

  patterns: [
    /^take\s+(.+)$/i,
    /^get\s+(.+)$/i,
    /^take/i,
    /^get/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      socket.emit('output', { message: 'What do you want to take?' });
    }
    this.execute(socket, match[1]);
  },

  execute(socket, itemName) {
    function saveItem(item) {
      // and give it to the user
      if (item.type === 'key') {
        socket.character.keys.push(item);
      } else {
        socket.character.inventory.push(item);
      }
      socket.character.save(err => { if (err) throw err; });
      socket.emit('output', { message: `${item.displayName} was added to your inventory.` });
    }

    const acResult = autocomplete.autocompleteTypes(socket, ['room'], itemName);
    if (acResult) {
      const roomItem = acResult.item;

      // fixed items cannot be taken, such as a sign.
      if (roomItem.fixed) {
        socket.emit('output', { message: 'You cannot take that!' });
        return;
      }
      if (roomItem.hidden && !socket.user.admin) {
        //ignore players from unknowingly grabbing a hidden item
        socket.emit('output', { message: 'You don\'t see that here!' });
        return;
      }
      // take the item from the room
      const room = Room.getById(socket.character.roomId);
      utils.removeItem(room.inventory, roomItem);

      saveItem(roomItem);
      room.save(err => { if (err) throw err; });

      socket.emit('output', { message: `${roomItem.displayName} taken.` });
      socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} takes ${roomItem.displayName}.` });
      return;
    }

    socket.emit('output', { message: 'You don\'t see that here!' });
    return;
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />';
    socket.emit('output', { message: output });
  },
};
