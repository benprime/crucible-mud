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
      this.help(socket.character);
      return Promise.resolve();
    }
    return this.execute(socket.character, match[1]);
  },

  execute(character, username) {

    const targetPlayer = autocomplete.character(character, username);
    if (!targetPlayer) {
      character.output('unknown player.');
      return Promise.reject();
    }

    if (targetPlayer.roomId !== character.roomId) {
      character.output('That player doesn\'t appear to be in the room.');
      return Promise.reject();
    }

    if (!targetPlayer.isIncapacitated()) {
      character.output(`${targetPlayer.name} is not in need of your assistance.`);
      return Promise.reject();
    }

    if(character.dragging === targetPlayer.id) {
      character.output(`You are already dragging ${targetPlayer.name}.`);
      return Promise.reject();
    }

    const draggers = socketUtil.getRoomSockets(character.roomId)
      .filter(s => s.character.dragging === targetPlayer.id)
      .map(s => s.character);

    if (draggers.length > 0) {
      character.output(`${targetPlayer.name} is already being dragged by ${draggers[0].name}.`);
      return Promise.reject();
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
