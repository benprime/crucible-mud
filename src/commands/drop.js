import Room from '../models/room';
import autocomplete from '../core/autocomplete';

export default {
  name: 'drop',

  patterns: [
    /^dr\s+(.+)$/i,
    /^drop\s+(.+)$/i,
    /^drop/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      socket.emit('output', { message: 'What do you want to drop?' });
      return;
    }
    this.execute(socket, match[1]);
  },

  execute(socket, itemName) {
    const room = Room.getById(socket.character.roomId);
    const result = autocomplete.autocompleteTypes(socket, ['inventory', 'key'], itemName);
    if (!result) {
      return;
    }

    // remove item from users inventory or key ring
    if (result.item.type === 'item') {
      socket.character.inventory.remove(result.item);
    } else if (result.item.type === 'key') {
      socket.character.keys.remove(result.item);
    } else {
      // just a catch for bad data
      socket.emit('output', { message: 'Unknown item type!' });
      return;
    }

    // and place it in the room
    room.inventory.push(result.item);

    // save both
    room.save(err => { if (err) throw err; });
    socket.character.save(err => { if (err) throw err; });

    socket.emit('output', { message: 'Dropped.' });
    socket.broadcast.to(socket.character.roomId).emit('output', { message: `${socket.user.username} drops ${result.item.displayName}.` });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">drop &lt;item name&gt </span><span class="purple">-</span> Drop <item> from inventory onto the floor.<br>';
    socket.emit('output', { message: output });
  },

};
