import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import lookCmd from './look';
import commandCategories from '../core/commandCategories';

export default {
  name: 'summon',
  desc: 'teleport another player to your location',
  category: commandCategories.admin,
  admin: true,

  patterns: [
    /^summon\s+(\w+)$/i,
    /^sum\s+(\w+)$/i,
    /^summon$/i,
    /^sum$/i,
  ],

  dispatch(socket, match) {
    if(match.length < 2) {
      this.help(socket.character);
    }
    return this.execute(socket.character, match[1]);
  },

  execute(character, name) {

    // autocomplete character
    const targetCharacter = autocomplete.character(character, name);
    if (!targetCharacter) {
      character.output('Player not found.');
      return Promise.reject();
    }

    const oldRoomId = targetCharacter.roomId;

    return targetCharacter.teleport(character.roomId).then(() => {
      lookCmd.execute(targetCharacter);

      socketUtil.roomMessage(oldRoomId, `${targetCharacter.name} vanishes!`);
      character.toRoom(`${targetCharacter.name} appears out of thin air!`, [targetCharacter.id]);
      targetCharacter.output(`You were summoned to ${character.name}'s room!`);
      return Promise.resolve();
    });
  },

  help(character) {
    let output = '';
    output += '<span class="mediumOrchid">summon &lt;username&gt; </span><span class="purple">-</span> Summon &lt;player&gt; to current room.<br />';
    character.output(output);
  },
};
