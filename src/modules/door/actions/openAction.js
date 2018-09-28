import Room from '../../../models/room';

export default {
  name: 'open',
  execute(character, dir) {
    const room = Room.getById(character.roomId);
    return room.openDoor(dir).then(() => {
      character.output('Door opened.');
      character.toRoom(`${character.name} opens the door to the ${dir.long}.`, [character.id]);
      return Promise.resolve();
    });
  },
};
