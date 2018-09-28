import Room from '../../../models/room';
import characterStates from '../../../core/characterStates';
import healthStatus from '../../../models/enums/healthStatuses';
import { pronounReflexive, pronounSubject } from '../../../core/language';

export default {
  name: 'rest',
  execute(character) {

    if (character.currentHP >= character.maxHP) {
      character.output('You are fully healed! Don\'t be lazy!');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);
    if (room.mobs.length > 0) {
      character.output('<span class="red">You cannot rest with enemies in the room!</span>\n');
      return Promise.reject();
    }

    character.setState(characterStates.RESTING);

    const status = character.status();
    let msg = '<span class="silver">';
    switch (status) {
      case healthStatus.SEVERELY_WOUNDED:
        msg += `${character.name} collapses to the ground for some much needed rest.`;
        break;
      case healthStatus.MODERATELY_WOUNDED:
        msg += `${character.name} stumbles to the ground for some much needed rest.`;
        break;
      case healthStatus.LIGHTLY_WOUNDED:
        msg += `${character.name} winces as ${pronounSubject(character.gender)} lowers ${pronounReflexive(character.gender)} to the ground for some much needed rest.`;
        break;
    }
    msg += `${character.name} is resting.`;
    msg += '</span>\n';

    room.output(msg);
    return Promise.resolve();
  },
};
