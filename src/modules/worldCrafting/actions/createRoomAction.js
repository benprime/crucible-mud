import Room from '../../../models/room';

export default {
  name: 'create room',
  execute(character, dir) {
    const room = Room.getById(character.roomId);

    return room.createRoom(dir).then(() => {
      character.output('Room created.');
      character.toRoom(`${character.name} waves his hand and an exit appears to the ${dir.long}!`, [character.id]);
      return Promise.resolve();
    });
  },

};
