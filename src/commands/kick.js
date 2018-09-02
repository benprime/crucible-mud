import autocomplete from '../core/autocomplete';
import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'kick',
  desc: 'kick an item in a particular direction',
  category: commandCategories.item,
  
  patterns: [
    /^kick\s+(.+)\s+(\w+)$/i,
    /^kick\s+(.+)$/i,
    /^kick$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 3) {
      this.help(socket.character);
      return Promise.resolve();
    }
    return this.execute(socket.character, match[1], match[2]);
  },

  execute(character, itemName, dir) {

    const item = autocomplete.room(character, itemName);
    if (!item) {
      character.output('You don\'t see that item here');
      return Promise.reject();
    }

    if (!Room.validDirectionInput(dir)) {
      character.output('Invalid direction.');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);
    return room.kick(character, item, dir);
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">kick &lt;item name&gt; &lt;dir&gt;</span><span class="purple">-</span> Kick &lt;item&gt; from this room to the direction specified in &lt;dir&gt;<br />';
    character.output(output);
  },
};
