import Room from '../models/room';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'track',
  desc: 'Attempt to track another player',
  category: commandCategories.special,

  patterns: [
    /^track\s+(\w+)$/i,
    /^track$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 2) {
      return this.help(socket);
    }

    return this.execute(socket.character, match[1])
      .then(output => socket.character.output(output))
      .catch(output => socket.character.output(output));
  },

  execute(character, name) {

    const targetChar = autocomplete.character(character, name);
    if (!targetChar) {
      return Promise.reject('Unknown player.');
    }

    const room = Room.getById(character.roomId);
    return room.track(targetChar);
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">track</span> <span class="purple">-</span> Attempt to track a player that has passed through your current room.<br />';
    socket.emit('output', { message: output });
  },
};
