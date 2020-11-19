import Room from '../../../models/room';

export default {
  name: 'create door',
  execute(character, dir) {
    const room = Room.getById(character.roomId);
    return room.createDoor(dir).then(() => {
      character.output('Door created.');
      character.toRoom(`${character.name} waves his hand and a door appears to the ${dir.long}!`, [character.id]);
      return Promise.resolve();
    });
  },

};
