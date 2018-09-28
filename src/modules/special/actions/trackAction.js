import Room from '../../../models/room';
import autocomplete from '../../../core/autocomplete';

export default {
  name: 'track',
  execute(character, name) {

    const targetChar = autocomplete.character(character, name);
    if (!targetChar) {
      character.output('Unknown player.');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);
    return room.track(targetChar).then(output => character.output(output));
  },
};
