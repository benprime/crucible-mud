import Room from '../../../models/room';

export default {
  name: 'move',
  execute(character, dir) {
    character.move(dir).then(() => {
      // only leave your party on a successful move
      character.leader = null;
      const room = Room.getById(character.roomId);
      character.action('look', false, room);
    }).catch(output => character.output(output));
  },
};
