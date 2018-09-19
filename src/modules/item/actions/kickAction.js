import Room from '../../../models/room';

export default {
  name: 'kick',
  execute(character, item, dir) {

    if (!item) {
      character.output('You don\'t see that item here');
      return Promise.reject();
    }

    if (!dir) {
      character.output('Invalid direction.');
      return Promise.reject();
    }

    const room = Room.getById(character.roomId);
    return room.kick(character, item, dir);
  },
};
