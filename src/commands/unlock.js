import config from '../config';
import autocomplete from '../core/autocomplete';
import socketUtil from '../core/socketUtil';
import Room from '../models/room';
import commandCategories from '../core/commandCategories';

export default {
  name: 'unlock',
  desc: 'unlock a door with a key',
  category: commandCategories.door,

  patterns: [
    /^unlock\s+(\w+)\s+with\s+(.+)$/i,
    /^unlock\s+/i,
    /^unlock$/i,
  ],

  dispatch(socket, match) {
    if (match.length != 3) {
      this.help(socket);
      return;
    }
    const dir = match[1].toLowerCase();
    const keyName = match[2];
    return this.execute(socket.character, dir, keyName)
      .then(output => socketUtil.output(socket, output))
      .catch(error => socket.emit('output', { message: error }));
  },

  execute(character, dir, keyName, cb) {
    const room = Room.getById(character.roomId);
    dir = Room.validDirectionInput(dir);
    let exit = room.getExit(dir);
    if (!exit) {
      return Promise.reject('No door in that direction.');
    }
    let displayDir = Room.shortToLong(exit.dir);

    if (!exit.locked) {
      return Promise.reject('That door is not locked.');
    }

    const acResult = autocomplete.multiple(character, ['key'], keyName);
    if (!acResult) {
      return Promise.reject('You don\'t seem to be carrying that key.');
    }

    const key = acResult.item;

    if (key.name != exit.keyName) {
      return Promise.reject('That key does not unlock that door.');
    }

    setTimeout(() => {
      exit.locked = true;
      let doorDesc;
      if (exit.dir === 'u') {
        doorDesc = 'above';
      } else if (exit.dir === 'd') {
        doorDesc = 'below';
      } else {
        doorDesc = `to the ${displayDir}`;
      }

      // todo: move this socket interaction to the room model
      if (exit.closed === true) {
        global.io.to(room.id).emit('output', { message: `The door ${doorDesc} clicks locked!` });
      } else {
        exit.closed = true;
        global.io.to(room.id).emit('output', { message: `The door ${doorDesc} slams shut and clicks locked!` });
      }
      if (cb) cb(exit);
    }, config.DOOR_CLOSE_TIMER);

    exit.locked = false;
    return Promise.resolve({
      charMessages: [
        { charId: character.id, message: 'Door unlocked.' },
      ],
      roomMessage: [
        { roomId: character.roomId, message: `${character.name} unlocks the door to the ${displayDir}.` },
      ],
    });
  },

  help(socket) {
    let output = '';
    output += '<span class="mediumOrchid">unlock &lt;dir&gt; with &lt;key name&gt; </span><span class="purple">-</span> Unlock a door with the key type you are carrying.<br />';
    socket.emit('output', { message: output });
  },

};
