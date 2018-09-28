import autocomplete from '../../../core/autocomplete';
import socketUtil from '../../../core/socketUtil';

export default {
  name: 'summon',
  execute(character, name) {

    // autocomplete character
    const targetCharacter = autocomplete.character(character, name);
    if (!targetCharacter) {
      character.output('Player not found.');
      return Promise.reject();
    }

    const oldRoomId = targetCharacter.roomId;

    return targetCharacter.teleport(character.roomId).then(() => {
      //lookCmd.execute(targetCharacter);

      socketUtil.roomMessage(oldRoomId, `${targetCharacter.name} vanishes!`);
      character.toRoom(`${targetCharacter.name} appears out of thin air!`, [targetCharacter.id]);
      targetCharacter.output(`You were summoned to ${character.name}'s room!`);
      return Promise.resolve();
    });
  },
};
