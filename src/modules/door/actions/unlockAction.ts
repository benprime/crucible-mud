import config from '../../../config';
import socketUtil from '../../../core/socketUtil';
import Room from '../../../models/room';

export default {
  name: 'unlock',
  execute(character, dir, key, cb?) {
    const room = Room.getById(character.roomId);
    let exit = room.getExit(dir.short);
    if (!exit) {
      character.output('No door in that direction.');
      return false;
    }

    if (!exit.locked) {
      character.output('That door is not locked.');
      return false;
    }

    if (!key) {
      character.output('You don\'t seem to be carrying that key.');
      return false;
    }


    if (key.name != exit.keyName) {
      character.output('That key does not unlock that door.');
      return false;
    }

    setTimeout(() => {
      exit.locked = true;
      let doorDesc;
      if (exit.dir === 'u') {
        doorDesc = 'above';
      } else if (exit.dir === 'd') {
        doorDesc = 'below';
      } else {
        doorDesc = `to the ${dir.long}`;
      }

      // todo: move this socket interaction to the room model
      if (exit.closed === true) {
        socketUtil.roomMessage(room.id, `The door ${doorDesc} clicks locked!`);
      } else {
        exit.closed = true;
        socketUtil.roomMessage(room.id, `The door ${doorDesc} slams shut and clicks locked!`);
      }
      if (cb) cb(exit);
    }, config.DOOR_CLOSE_TIMER);

    exit.locked = false;

    character.output('Door unlocked.');

    // todo: "To the down?"
    character.toRoom(`${character.name} unlocks the door to the ${dir.long}.`);

    return true;
  },

};
