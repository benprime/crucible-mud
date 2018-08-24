import breakCmd from './break';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import lookCmd from './look';

export default {
  name: 'summon',
  admin: true,

  patterns: [
    /^summon\s+(\w+)$/i,
    /^sum\s+(\w+)$/i,
  ],

  dispatch(socket, match) {
    this.execute(socket.character, match[1]);
  },

  execute(character, name) {

    // autocomplete character
    const targetCharacter = autocomplete.character(character, name);
    if (!targetCharacter) {
      return Promise.reject('Player not found.');
    }

    const oldRoomId = targetCharacter.roomId;

    return targetCharacter.teleport(character.roomId).then(() => {
      lookCmd.execute(targetCharacter);

      return Promise.resolve({
        roomMessages: [
          { roomId: oldRoomId, message: `${targetCharacter.name} vanishes!` },
          { roomId: character.roomId, message: `${targetCharacter.name} appears out of thin air!`, exclude: [character.id] },
        ],
        charMessages: [{ charId: targetCharacter.id, message: `You were summoned to ${character.name}'s room!` }],
      });

    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">summon &lt;username&gt; </span><span class="purple">-</span> Summon &lt;player&gt; to current room.<br />';
    socket.emit('output', { message: output });
  },
};
