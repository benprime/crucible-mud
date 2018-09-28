import Room from '../../../models/room';

export default {
  name: 'lock',
  execute(character, dir, key) {
    const room = Room.getById(character.roomId);
    let exit = room.getExit(dir.short);
    if (!exit || !('closed' in exit)) {
      character.output('No door in that direction.');
      return Promise.reject();
    }

    if (!key) {
      character.output('Unknown key.');
      return Promise.reject();
    }

    exit.closed = true;
    exit.keyName = key.name;
    exit.locked = true;
    room.save(err => { if (err) throw err; });
    character.output('Door locked.');
    return Promise.resolve();
  },
};
