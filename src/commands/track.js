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
      this.help(socket.character);
      return Promise.resolve();
    }

    return this.execute(socket.character, match[1]);
  },

  execute(character, name) {

    const targetChar = autocomplete.character(character, name);
    if (!targetChar) {
      character.output('Unknown player.');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);
    return room.track(targetChar);
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">track</span> <span class="purple">-</span> Attempt to track a player that has passed through your current room.<br />';
    character.output(output);
  },
};
