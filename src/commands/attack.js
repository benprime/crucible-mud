import Room from '../models/room';
import autocomplete from '../core/autocomplete';

export default {
  name: 'attack',

  patterns: [
    /^a\s+(.+)$/i,
    /^attack\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket, match[1]);
  },

  execute(socket, targetName) {
    const room = Room.getById(socket.character.roomId);
    const acResult = autocomplete.autocompleteTypes(socket, ['mob'], targetName);
    if (!acResult) {
      socket.character.attackTarget = null;
      return;
    }

    const target = acResult.item;

    socket.character.attackTarget = target.id;
    socket.character.attackInterval = 4000;

    socket.emit('output', { message: '<span class="olive">*** Combat Engaged ***</span>' });
    socket.broadcast.to(room.id).emit('output', { message: `${socket.user.username} moves to attack ${target.displayName}!` });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">attack &lt;mob name&gt;<span class="purple">|</span> a</span> <span class="purple">-</span> Begin combat attacking &lt;target&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
