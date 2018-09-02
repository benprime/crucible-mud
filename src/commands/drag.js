import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';
import commandCategories from '../core/commandCategories';

export default {
  name: 'drag',
  desc: 'Drag a player who is incapacitated',
  category: commandCategories.combat,

  patterns: [
    /^drag\s+(\w+)$/i,
    /^drag\s.+$/i,
  ],

  dispatch(socket, match) {
    if (match.length < 2) {
      return this.help(socket.character);
    }
    return this.execute(socket.character, match[1])
      .catch(response => socketUtil.output(socket, response));
  },

  execute(character, username) {

    const targetPlayer = autocomplete.character(character, username);
    if (!targetPlayer) {
      return Promise.reject('unknown player.');
    }

    if (targetPlayer.roomId !== character.roomId) {
      return Promise.reject('That player doesn\'t appear to be in the room.');
    }

    if (!targetPlayer.isIncapacitated()) {
      return Promise.reject(`${targetPlayer.name} is not in need of your assistance.`);
    }

    if(character.dragging === targetPlayer.id) {
      return Promise.reject(`You are already dragging ${targetPlayer.name}.`);
    }

    const draggers = socketUtil.getRoomSockets(character.roomId)
      .filter(s => s.character.dragging === targetPlayer.id)
      .map(s => s.character);

    if (draggers.length > 0) {
      return Promise.reject(`${targetPlayer.name} is already being dragged by ${draggers[0].name}.`);
    }

    character.dragging = targetPlayer.id;

    targetPlayer.output(`<span class="silver">${character.name} starts dragging you.</span>`);
    character.toRoom(`<span class="silver">${character.name} starts dragging ${targetPlayer.name}.</span>`, [targetPlayer.id]);
    character.output(`<span class="silver">You are now dragging ${targetPlayer.name}.</span>`);

    return Promise.resolve();
  },

  help(character) {
    const output = '<span class="mediumOrchid">drag &lt;player&gt; </span><span class="purple">-</span> Drag a player who is incapacitated.<br />';
    character.output(output);
  },
};
