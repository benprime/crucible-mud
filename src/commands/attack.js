import socketUtil from '../core/socketUtil';
import autocomplete from '../core/autocomplete';

export default {
  name: 'attack',
  desc: 'attack a monster',

  patterns: [
    /^a\s+(.+)$/i,
    /^attack\s+(.+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1])
      .then(commandResult => socketUtil.sendMessages(socket, commandResult))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, targetName) {

    if (character.isIncompacitated()) {
      return Promise.reject('<span class="firebrick">You are incompacitated!</span>\n');
    }

    const acResult = autocomplete.multiple(character, ['mob'], targetName);
    if (!acResult) {
      character.attackTarget = null;
      return Promise.reject('attack target not found');
    }

    const target = acResult.item;

    character.attackTarget = target.id;
    character.attackInterval = 4000;

    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: '<span class="olive">*** Combat Engaged ***</span>' },
      ],
      roomMessages: [
        { roomId: character.roomId, message: `${character.name} moves to attack ${target.displayName}!`, exclude: [character.id] },
      ],
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">attack &lt;mob name&gt;<span class="purple">|</span> a</span> <span class="purple">-</span> Begin combat attacking &lt;target&gt;.<br />';
    socket.emit('output', { message: output });
  },
};
