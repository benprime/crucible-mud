import Room from '../../../models/room';

export default {
  name: 'close',
  execute(character, dir) {
    const room = Room.getById(character.roomId);

    return room.closeDoor(dir).then(() => {
      character.output('Door closed.');
      character.toRoom(`${character.name} closes the door to the ${dir.long}.`, [character.id]);
      return Promise.resolve();
    });
  },
};
